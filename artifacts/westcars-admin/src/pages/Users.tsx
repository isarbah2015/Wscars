import { useState } from "react";
import { Search, ShieldCheck, Ban, CheckCircle } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { formatDate, AppUser } from "@/data/mock";

function StatusBadge({ status }: { status: AppUser["status"] }) {
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
      {status}
    </span>
  );
}

function TrustBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-500" : score >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-muted-foreground">{score}</span>
    </div>
  );
}

export default function Users() {
  const { users, updateUserStatus, verifyUser } = useAdmin();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "unverified" | "dealer" | "blocked">("all");

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || `${u.name} ${u.email} ${u.location}`.toLowerCase().includes(q);
    const matchF =
      filter === "all" ? true :
      filter === "verified" ? u.isVerified :
      filter === "unverified" ? !u.isVerified :
      filter === "dealer" ? u.isDealer :
      u.status === "blocked";
    return matchQ && matchF;
  });

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{users.length} registered users</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1 bg-card border border-input rounded-lg p-1">
          {(["all", "verified", "unverified", "dealer", "blocked"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize cursor-pointer ${filter === f ? "bg-[#0EB5CA] text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-card-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wide border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3">User</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Member Since</th>
                <th className="text-left px-4 py-3">Listings</th>
                <th className="text-left px-4 py-3">Trust</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">No users match your filter.</td></tr>
              )}
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0 bg-muted" onError={e => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/36"; }} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-foreground">{user.name}</p>
                          {user.isVerified && <CheckCircle size={12} className="text-[#0EB5CA]" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.location}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(user.memberSince)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.totalListings}</td>
                  <td className="px-4 py-3"><TrustBar score={user.trustScore} /></td>
                  <td className="px-4 py-3">
                    {user.isDealer
                      ? <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">Dealer</span>
                      : <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">Buyer/Seller</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {!user.isVerified && (
                        <button onClick={() => verifyUser(user.id)} title="Verify user" className="p-1.5 rounded-lg hover:bg-[#0EB5CA]/10 text-[#0EB5CA] transition-colors cursor-pointer">
                          <ShieldCheck size={15} />
                        </button>
                      )}
                      {user.status === "active" ? (
                        <button onClick={() => updateUserStatus(user.id, "blocked")} title="Block user" className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors cursor-pointer">
                          <Ban size={15} />
                        </button>
                      ) : (
                        <button onClick={() => updateUserStatus(user.id, "active")} title="Unblock user" className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors cursor-pointer">
                          <CheckCircle size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
          Showing {filtered.length} of {users.length} users
        </div>
      </div>
    </div>
  );
}
