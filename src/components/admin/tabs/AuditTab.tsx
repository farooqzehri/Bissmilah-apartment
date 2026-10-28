import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, Clock, User, Activity, RefreshCw } from "lucide-react";
import { AuditLog } from "../../../types/cms";
import { cmsAudit } from "../../../utils/cmsApi";

interface AuditTabProps {
  isDarkMode: boolean;
  onShowToast: (msg: string) => void;
}

export const AuditTab: React.FC<AuditTabProps> = ({ isDarkMode, onShowToast }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await cmsAudit.list();
      setLogs(data);
    } catch (err: any) {
      onShowToast("Failed to fetch audit logs: " + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-stone-800 border-stone-200">
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-[#FF9E4A] font-bold block">
            IMMUTABLE SECURITY TRAIL
          </span>
          <h2 className="text-xl sm:text-2xl font-display font-medium">
            System & Activity Audit Logs
          </h2>
          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-stone-400" : "text-stone-500"}`}>
            Track all administrative actions, property listings, settings updates, and logins.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className={`p-2.5 rounded-full border flex items-center gap-1.5 text-xs font-display cursor-pointer transition-colors ${
            isDarkMode ? "border-stone-800 hover:bg-stone-800" : "border-stone-200 hover:bg-stone-100"
          }`}
          title="Refresh Logs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
        <input
          type="text"
          placeholder="Search activity by action, user or details..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs font-display border focus:outline-none focus:border-[#FF9E4A] ${
            isDarkMode ? "bg-stone-900 border-stone-800 text-white" : "bg-white border-stone-300 text-stone-900"
          }`}
        />
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs font-mono">Loading audit logs...</div>
      ) : filtered.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200"
        }`}>
          <ShieldCheck size={36} className="mx-auto text-stone-400 mb-3" />
          <h3 className="font-display text-base font-medium">No audit entries found</h3>
        </div>
      ) : (
        <div className={`rounded-3xl border overflow-hidden ${
          isDarkMode ? "bg-[#181817] border-stone-800" : "bg-white border-stone-200 shadow-sm"
        }`}>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[10px] font-mono uppercase tracking-wider ${
                isDarkMode ? "border-stone-800 text-stone-400 bg-stone-900/40" : "border-stone-200 text-stone-500 bg-[#F9F9F8]"
              }`}>
                <th className="p-4 pl-6">Timestamp</th>
                <th className="p-4">Action</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Details</th>
                <th className="p-4 pr-6">Performed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/50 dark:divide-stone-800/80">
              {filtered.map((log) => (
                <tr key={log.id} className={isDarkMode ? "hover:bg-stone-900/40" : "hover:bg-stone-50"}>
                  <td className="p-4 pl-6 font-mono text-[11px] text-stone-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full font-mono text-[9px] uppercase tracking-wider font-semibold bg-[#FF9E4A]/10 text-[#FF9E4A] border border-[#FF9E4A]/20">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-stone-300">
                    {log.entity}
                  </td>
                  <td className="p-4 max-w-md font-display">
                    {log.details}
                  </td>
                  <td className="p-4 pr-6 font-mono text-[11px] text-stone-400">
                    {log.performedBy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
