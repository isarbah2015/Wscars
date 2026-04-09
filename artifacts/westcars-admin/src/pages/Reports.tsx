import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle, Car, Users, MessageCircle } from "lucide-react";
import { MOCK_REPORTS, formatDate, Report } from "@/data/mock";

function TypeIcon({ type }: { type: Report["type"] }) {
  if (type === "listing") return <Car size={14} className="text-[#0EB5CA]" />;
  if (type === "user") return <Users size={14} className="text-purple-500" />;
  return <MessageCircle size={14} className="text-amber-500" />;
}

function StatusBadge({ status }: { status: Report["status"] }) {
  const map: Record<string, string> = {
    open: "bg-red-100 text-red-700",
    resolved: "bg-green-100 text-green-700",
    dismissed: "bg-slate-100 text-slate-600",
  };
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${map[status]}`}>{status}</span>;
}

export default function Reports() {
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [filter, setFilter] = useState<Report["status"] | "all">("all");

  const filtered = filter === "all" ? reports : reports.filter(r => r.status === filter);

  function resolve(id: string) { setReports(prev => prev.map(r => r.id === id ? { ...r, status: "resolved" as const } : r)); }
  function dismiss(id: string) { setReports(prev => prev.map(r => r.id === id ? { ...r, status: "dismissed" as const } : r)); }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{reports.filter(r => r.status === "open").length} open reports</p>
      </div>

      <div className="flex gap-1 bg-card border border-input rounded-lg p-1 w-fit">
        {(["all", "open", "resolved", "dismissed"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize cursor-pointer ${filter === f ? "bg-[#0EB5CA] text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="bg-card rounded-xl border border-card-border p-10 text-center text-muted-foreground">No reports here.</div>
        )}
        {filtered.map(report => (
          <div key={report.id} className={`bg-card rounded-xl border p-4 ${report.status === "open" ? "border-red-200" : "border-card-border"}`}>
            <div className="flex items-start gap-4">
              <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${report.status === "open" ? "bg-red-100" : "bg-muted"}`}>
                <AlertTriangle size={16} className={report.status === "open" ? "text-red-600" : "text-muted-foreground"} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <TypeIcon type={report.type} />
                    <span className="capitalize">{report.type}</span>
                    <span className="text-foreground font-semibold">— {report.targetName}</span>
                  </div>
                  <StatusBadge status={report.status} />
                </div>
                <p className="text-sm text-foreground">{report.reason}</p>
                <p className="text-xs text-muted-foreground mt-1.5">Reported by <span className="font-medium">{report.reportedBy}</span> · {formatDate(report.createdAt)}</p>
              </div>
              {report.status === "open" && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => resolve(report.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors cursor-pointer">
                    <CheckCircle size={13} /> Resolve
                  </button>
                  <button onClick={() => dismiss(report.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors cursor-pointer">
                    <XCircle size={13} /> Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
