import React, { useState } from "react";
import { 
  Users, Search, Filter, Phone, MessageSquare, CheckCircle2, 
  Clock, Trash2, Plus, ArrowUpRight, Calendar, UserCheck, ShieldAlert 
} from "lucide-react";
import { EnquiryLead } from "../../../types/cms";
import { cmsEnquiries } from "../../../utils/cmsApi";

interface LeadsTabProps {
  enquiries: EnquiryLead[];
  onRefreshLeads: () => Promise<void>;
  isDarkMode: boolean;
  onShowToast: (msg: string) => void;
}

export const LeadsTab: React.FC<LeadsTabProps> = ({
  enquiries,
  onRefreshLeads,
  isDarkMode,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<EnquiryLead | null>(null);
  const [newNote, setNewNote] = useState("");

  const statuses = ["all", "New", "Contacted", "In Review", "Closed", "Archived"];

  const filtered = enquiries.filter((lead) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      lead.clientName.toLowerCase().includes(q) ||
      lead.phone.toLowerCase().includes(q) ||
      lead.token.toLowerCase().includes(q) ||
      lead.propertyInterest.toLowerCase().includes(q) ||
      (lead.clientNote && lead.clientNote.toLowerCase().includes(q));
    const matchesStatus = selectedStatus === "all" || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await cmsEnquiries.update(id, { status: newStatus });
      await onRefreshLeads();
      onShowToast(`Lead status updated to "${newStatus}".`);
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus as any });
      }
    } catch (err: any) {
      onShowToast("Failed to update status: " + (err.message || String(err)));
    }
  };

  const handleAddNote = async (id: string) => {
    if (!newNote.trim()) return;
    try {
      const updated = await cmsEnquiries.update(id, { note: newNote.trim() });
      setNewNote("");
      await onRefreshLeads();
      setSelectedLead(updated);
      onShowToast("Note added to client file.");
    } catch (err: any) {
      onShowToast("Failed to add note: " + (err.message || String(err)));
    }
  };

  const handleDeleteLead = async (id: string, token: string) => {
    if (!window.confirm(`Delete lead record ${token}?`)) return;
    try {
      await cmsEnquiries.delete(id);
      await onRefreshLeads();
      if (selectedLead?.id === id) setSelectedLead(null);
      onShowToast(`Lead record ${token} deleted.`);
    } catch (err: any) {
      onShowToast("Failed to delete lead: " + (err.message || String(err)));
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-stone-800 border-stone-200">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold block">
            CLIENT RELATIONSHIP MANAGEMENT
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-medium">
            Booking Inquiries & Leads ({enquiries.length})
          </h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
            Track incoming consultation requests, schedule meetings with Haji Saud Zehri, and log private client notes.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
          <input
            type="text"
            placeholder="Search by client name, token, or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
              isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
            }`}
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-display transition-all cursor-pointer border ${
                selectedStatus === st
                  ? "bg-[#FF9E4A] text-black font-semibold border-[#FF9E4A]"
                  : isDarkMode ? "bg-stone-900 border-stone-800 text-stone-400 hover:text-white" : "bg-white border-stone-200 text-stone-700 hover:text-black"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Leads List Table / Cards */}
        <div className={`${selectedLead ? "lg:col-span-7" : "lg:col-span-12"} space-y-3`}>
          {filtered.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border ${
              isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200"
            }`}>
              <Users size={36} className="mx-auto text-stone-400 mb-3" />
              <h3 className="font-display text-base font-medium">No matching client inquiries</h3>
            </div>
          ) : (
            filtered.map((lead) => {
              const isSelected = selectedLead?.id === lead.id;
              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#FF9E4A] ring-1 ring-[#FF9E4A]/30 " + (isDarkMode ? "bg-stone-900" : "bg-white")
                      : isDarkMode ? "bg-[#181817] border-stone-800 hover:border-stone-700" : "bg-white border-stone-200 hover:border-stone-300 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-medium text-sm">{lead.clientName}</span>
                        <span className="font-mono text-[10px] text-stone-400">{lead.token}</span>
                      </div>
                      <span className="font-mono text-[11px] text-[#FF9E4A] block mt-0.5">
                        {lead.phone} {lead.email ? `• ${lead.email}` : ""}
                      </span>
                    </div>

                    <select
                      value={lead.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold uppercase tracking-wider border cursor-pointer ${
                        lead.status === "New"
                          ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                          : lead.status === "In Review"
                          ? "bg-[#FF9E4A]/10 text-[#FF9E4A] border-[#FF9E4A]/30"
                          : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      }`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="In Review">In Review</option>
                      <option value="Closed">Closed</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>

                  <div className="mt-3 pt-3 border-t dark:border-stone-800/80 border-stone-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-stone-400 truncate max-w-sm">
                      Interest: <strong className={isDarkMode ? "text-stone-200" : "text-stone-800"}>{lead.propertyInterest}</strong>
                    </span>
                    <span className="font-mono text-[10px] text-stone-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Lead Detail Panel */}
        {selectedLead && (
          <div className={`lg:col-span-5 p-6 rounded-3xl border sticky top-28 space-y-5 ${
            isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-md"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b dark:border-stone-800 border-stone-200">
              <div>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#FF9E4A]">CLIENT DOSSIER</span>
                <h3 className="font-display font-medium text-base">{selectedLead.clientName}</h3>
              </div>
              <button
                onClick={() => handleDeleteLead(selectedLead.id, selectedLead.token)}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                title="Delete Lead"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">Direct Phone</span>
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="font-mono text-sm text-[#FF9E4A] hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <Phone size={13} />
                  <span>{selectedLead.phone}</span>
                </a>
              </div>

              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">WhatsApp Direct Link</span>
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-emerald-500 hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <MessageSquare size={13} />
                  <span>Open WhatsApp Chat</span>
                </a>
              </div>

              <div>
                <span className="text-stone-400 font-mono text-[10px] uppercase block">Property of Interest</span>
                <span className="font-medium block mt-0.5">{selectedLead.propertyInterest}</span>
              </div>

              {selectedLead.clientNote && (
                <div>
                  <span className="text-stone-400 font-mono text-[10px] uppercase block">Client Message</span>
                  <p className={`p-3 rounded-xl border mt-1 leading-relaxed ${
                    isDarkMode ? "bg-stone-900 border-stone-800 text-stone-200" : "bg-[#F9F9F8] border-stone-200 text-stone-700"
                  }`}>
                    "{selectedLead.clientNote}"
                  </p>
                </div>
              )}

              {/* Internal Staff Notes Log */}
              <div className="pt-3 border-t dark:border-stone-800 border-stone-200">
                <span className="text-stone-400 font-mono text-[10px] uppercase block mb-2">Staff Case Notes</span>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {selectedLead.internalNotes.map((note, i) => (
                    <div key={i} className="text-[11px] font-mono p-2 rounded-lg bg-stone-900/40 border border-stone-800 text-stone-300">
                      {note}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Add meeting note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddNote(selectedLead.id);
                    }}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs border ${
                      isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300"
                    }`}
                  />
                  <button
                    onClick={() => handleAddNote(selectedLead.id)}
                    className="px-3 py-2 rounded-xl text-xs font-display bg-[#FF9E4A] text-black font-semibold cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
