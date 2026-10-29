import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { EnquiryLead } from "../types";
import { isMongoConnected } from "../db/mongodb";
import { CustomerInquiryModel } from "../models/CustomerInquiry";

const router = Router();
const recentSubmissions = new Map<string, number>();

// POST /api/enquiries - Public lead / booking submission
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, phone, email, interest, preferredDate, meetingType, message } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({ error: "Please provide a valid client name (minimum 2 characters)" });
      return;
    }

    if (!phone || typeof phone !== "string" || phone.trim().length < 7) {
      res.status(400).json({ error: "Please provide a valid contact telephone or WhatsApp number" });
      return;
    }

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
      email: email && typeof email === "string" ? email.trim() : undefined,
      propertyInterest: interest || "The Zehri Heights Penthouses (Shandaar Residence)",
      preferredDate: preferredDate || new Date().toISOString().split("T")[0],
      meetingType: meetingType || "office",
      clientNote: message && typeof message === "string" ? message.trim() : "",
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
        const q = search.trim();
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
    const { status, note } = req.body;
    const now = new Date().toISOString();

    let updatedLead: EnquiryLead | null = null;

    if (isMongoConnected()) {
      const doc = await CustomerInquiryModel.findOne({ id });
      if (doc) {
        if (status) doc.status = status;
        if (note && note.trim()) doc.internalNotes = [...(doc.internalNotes || []), note.trim()];
        doc.updatedAt = new Date();
        await doc.save();
        updatedLead = doc.toObject() as any;
      }
    }

    const db = dbManager.getDb();
    const index = db.enquiries.findIndex((e) => e.id === id);

    if (index !== -1) {
      if (status) db.enquiries[index].status = status;
      if (note && note.trim()) {
        db.enquiries[index].internalNotes = [
          ...(db.enquiries[index].internalNotes || []),
          note.trim(),
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
