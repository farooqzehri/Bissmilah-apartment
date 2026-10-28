import { Router, Request, Response } from "express";
import { dbManager } from "../db";
import { requireAdminAuth } from "./auth";
import { EnquiryLead } from "../types";

const router = Router();

// Basic IP rate limiting store
const recentSubmissions = new Map<string, number>();

// POST /api/enquiries - Public lead / booking submission
router.post("/", (req: Request, res: Response) => {
  const { name, phone, email, interest, preferredDate, meetingType, message } = req.body;

  // Validation
  if (!name || typeof name !== "string" || name.trim().length < 2) {
    res.status(400).json({ error: "Please provide a valid client name (minimum 2 characters)" });
    return;
  }

  if (!phone || typeof phone !== "string" || phone.trim().length < 7) {
    res.status(400).json({ error: "Please provide a valid contact telephone or WhatsApp number" });
    return;
  }

  // Basic anti-spam rate limiting: 1 submission per 10 seconds per IP
  const clientIp = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const lastTime = recentSubmissions.get(clientIp);
  if (lastTime && now - lastTime < 10000) {
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
    propertyInterest: interest || "Apartments & Luxury Estates in Quetta",
    preferredDate: preferredDate || new Date().toISOString().split("T")[0],
    meetingType: meetingType || "office",
    clientNote: message && typeof message === "string" ? message.trim() : "",
    status: "New",
    internalNotes: [`Inquiry received online via website. IP: ${clientIp}`],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const db = dbManager.getDb();
  db.enquiries.unshift(lead);
  dbManager.saveDb(db);
  dbManager.addAuditLog("NEW_LEAD", "Enquiry", `New booking inquiry received from ${lead.clientName} (${token})`, id);

  res.status(201).json({
    success: true,
    token,
    data: lead,
    message: "Your inquiry has been registered with Haji Saud Zehri private office.",
  });
});

// GET /api/enquiries - Admin list leads
router.get("/", requireAdminAuth, (req: Request, res: Response) => {
  const { status, search } = req.query;
  const db = dbManager.getDb();
  let list = [...db.enquiries];

  if (status && status !== "all") {
    list = list.filter((e) => e.status === status);
  }

  if (search && typeof search === "string" && search.trim() !== "") {
    const q = search.toLowerCase();
    list = list.filter(
      (e) =>
        e.clientName.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        e.token.toLowerCase().includes(q) ||
        e.propertyInterest.toLowerCase().includes(q) ||
        (e.clientNote && e.clientNote.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    data: list,
    total: list.length,
  });
});

// PUT /api/enquiries/:id - Admin update status or append note
router.put("/:id", requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const db = dbManager.getDb();

  const item = db.enquiries.find((e) => e.id === id);
  if (!item) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  if (status) {
    item.status = status;
  }

  if (note && typeof note === "string" && note.trim() !== "") {
    item.internalNotes.push(`${new Date().toLocaleDateString()}: ${note.trim()}`);
  }

  item.updatedAt = new Date().toISOString();
  dbManager.saveDb(db);
  dbManager.addAuditLog("UPDATE_LEAD", "Enquiry", `Updated lead status/notes for ${item.clientName}`, id);

  res.json({
    success: true,
    data: item,
    message: "Lead updated successfully",
  });
});

// DELETE /api/enquiries/:id - Admin delete lead
router.delete("/:id", requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = dbManager.getDb();

  const index = db.enquiries.findIndex((e) => e.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const removed = db.enquiries.splice(index, 1)[0];
  dbManager.saveDb(db);
  dbManager.addAuditLog("DELETE_LEAD", "Enquiry", `Deleted lead from ${removed.clientName}`, id);

  res.json({
    success: true,
    message: `Lead ${removed.token} deleted`,
  });
});

export default router;
