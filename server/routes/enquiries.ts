import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { EnquiryLead } from "../types";
import { isMongoConnected } from "../db/mongodb";
import { CustomerInquiryModel } from "../models/CustomerInquiry";
import { escapeRegex } from "../utils/search";

const router = Router();
const recentSubmissions = new Map<string, number>();
const ENQUIRY_STATUSES: EnquiryLead["status"][] = [
  "New",
  "Contacted",
  "In Review",
  "Booked",
  "Closed",
  "Archived",
];

function isEnquiryStatus(value: unknown): value is EnquiryLead["status"] {
  return typeof value === "string" && ENQUIRY_STATUSES.some((status) => status === value);
}

// POST /api/enquiries - Public lead / booking submission
router.post("/", async (req: Request, res: Response) => {
  try {
    const body: Record<string, unknown> =
      req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const { name, phone, email, interest, preferredDate, meetingType, message } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ error: "Please provide a valid client name (minimum 2 characters)" });
      return;
    }

    if (!phone || typeof phone !== "string" || phone.trim().length < 7) {
      res.status(400).json({ error: "Please provide a valid contact telephone or WhatsApp number" });
      return;
    }

    if (
      (email !== undefined && typeof email !== "string") ||
      (interest !== undefined && typeof interest !== "string") ||
      (preferredDate !== undefined && typeof preferredDate !== "string") ||
      (meetingType !== undefined && typeof meetingType !== "string") ||
      (message !== undefined && typeof message !== "string")
    ) {
      res.status(400).json({ error: "Optional enquiry fields must be strings" });
      return;
    }

    const normalizedEmail = typeof email === "string" && email.trim() ? email.trim() : undefined;
    const propertyInterest =
      typeof interest === "string" && interest.trim()
        ? interest.trim()
        : "The Zehri Heights Penthouses (Shandaar Residence)";
    const normalizedPreferredDate =
      typeof preferredDate === "string" && preferredDate.trim()
        ? preferredDate.trim()
        : new Date().toISOString().split("T")[0];
    const normalizedMeetingType =
      typeof meetingType === "string" && meetingType.trim() ? meetingType.trim() : "office";

    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const lastTime = recentSubmissions.get(clientIp);
    if (lastTime && now - lastTime < 5000) {
      res.status(429).json({ error: "Please wait a moment before sending another booking request." });
      return;
    }
    recentSubmissions.set(clientIp, now);

    const token = "BME-" + Math.floor(100000 + Math.random() * 900000).toString();
    const id = `enq-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const lead: EnquiryLead = {
      id,
      token,
      clientName: name.trim(),
      phone: phone.trim(),
      email: normalizedEmail,
      propertyInterest,
      preferredDate: normalizedPreferredDate,
      meetingType: normalizedMeetingType,
      clientNote: typeof message === "string" ? message.trim() : "",
      status: "New",
      internalNotes: [`Inquiry registered via California VIP Concierge form. IP: ${clientIp}`],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isMongoConnected()) {
      await CustomerInquiryModel.create(lead);
    }

    const db = dbManager.getDb();
    db.enquiries.unshift(lead);
    dbManager.saveDb(db);
    dbManager.addAuditLog("NEW_LEAD", "Enquiry", `New booking inquiry received from ${lead.clientName} (${token})`, id);

    res.status(201).json({
      success: true,
      token,
      data: lead,
      message: `Shukriya ${lead.clientName}! Your private showing dossier #${token} has been scheduled.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to submit enquiry: " + err.message });
  }
});

// GET /api/enquiries - Admin list inquiries
router.get("/", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query;

    if (isMongoConnected()) {
      const query: any = {};
      if (status && status !== "all") {
        query.status = status;
      }
      if (search && typeof search === "string" && search.trim() !== "") {
        const q = escapeRegex(search.trim());
        query.$or = [
          { clientName: { $regex: q, $options: "i" } },
          { phone: { $regex: q, $options: "i" } },
          { token: { $regex: q, $options: "i" } },
          { propertyInterest: { $regex: q, $options: "i" } },
        ];
      }

      const mongoLeads = await CustomerInquiryModel.find(query).sort({ createdAt: -1 }).lean();
      if (mongoLeads) {
        res.json({
          success: true,
          source: "MongoDB Atlas",
          data: mongoLeads,
          total: mongoLeads.length,
        });
        return;
      }
    }

    // Fallback: Local
    const db = dbManager.getDb();
    let list = [...db.enquiries];

    if (status && status !== "all") {
      list = list.filter((e) => e.status.toLowerCase() === (status as string).toLowerCase());
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.clientName.toLowerCase().includes(q) ||
          e.phone.toLowerCase().includes(q) ||
          e.token.toLowerCase().includes(q) ||
          e.propertyInterest.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      source: "Local Storage",
      data: list,
      total: list.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch enquiries: " + err.message });
  }
});

// PUT /api/enquiries/:id - Admin update lead status / note
router.put("/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body: Record<string, unknown> =
      req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
    const { status, note } = body;
    const validStatus = isEnquiryStatus(status) ? status : undefined;
    const noteText = typeof note === "string" ? note.trim() : "";
    const now = new Date().toISOString();

    if (status !== undefined && !validStatus) {
      res.status(400).json({ error: "Please provide a valid enquiry status" });
      return;
    }

    if (note !== undefined && typeof note !== "string") {
      res.status(400).json({ error: "Note must be a string" });
      return;
    }

    let updatedLead: EnquiryLead | null = null;

    if (isMongoConnected()) {
      const doc = await CustomerInquiryModel.findOne({ id });
      if (doc) {
        if (validStatus) doc.status = validStatus;
        if (noteText) doc.internalNotes = [...(doc.internalNotes || []), noteText];
        doc.updatedAt = new Date();
        await doc.save();
        const saved = doc.toObject();
        updatedLead = {
          id: saved.id,
          token: saved.token,
          clientName: saved.clientName,
          phone: saved.phone,
          email: saved.email,
          propertyInterest: saved.propertyInterest || "",
          preferredDate: saved.preferredDate || "",
          meetingType: saved.meetingType,
          clientNote: saved.clientNote,
          status: saved.status,
          internalNotes: saved.internalNotes || [],
          createdAt: saved.createdAt.toISOString(),
          updatedAt: saved.updatedAt.toISOString(),
        };
      }
    }

    const db = dbManager.getDb();
    const index = db.enquiries.findIndex((e) => e.id === id);

    if (index !== -1) {
      if (validStatus) db.enquiries[index].status = validStatus;
      if (noteText) {
        db.enquiries[index].internalNotes = [
          ...(db.enquiries[index].internalNotes || []),
          noteText,
        ];
      }
      db.enquiries[index].updatedAt = now;
      dbManager.saveDb(db);
      if (!updatedLead) updatedLead = db.enquiries[index];
    }

    if (!updatedLead) {
      res.status(404).json({ error: "Enquiry not found" });
      return;
    }

    dbManager.addAuditLog("UPDATE_LEAD", "Enquiry", `Updated status to "${status}" for lead ${updatedLead.token}`, id);

    res.json({
      success: true,
      data: updatedLead,
      message: "Lead updated successfully",
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update enquiry: " + err.message });
  }
});

// DELETE /api/enquiries/:id - Admin delete lead
router.delete("/:id", requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (isMongoConnected()) {
      await CustomerInquiryModel.deleteOne({ id });
    }

    const db = dbManager.getDb();
    const index = db.enquiries.findIndex((e) => e.id === id);
    if (index !== -1) {
      db.enquiries.splice(index, 1);
      dbManager.saveDb(db);
    }

    dbManager.addAuditLog("DELETE_LEAD", "Enquiry", `Deleted lead ID: ${id}`, id);

    res.json({
      success: true,
      message: "Enquiry lead deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete enquiry: " + err.message });
  }
});

export default router;
