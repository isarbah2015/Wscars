import { useState } from "react";
import { Search, Eye, EyeOff, Trash2, CheckCircle, Star } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { formatPrice, formatDate, Car } from "@/data/mock";

function StatusBadge({ status }: { status: Car["status"] }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    hidden: "bg-slate-100 text-slate-600",
    sold: "bg-blue-100 text-blue-700",
  };
  return <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${styles[status] ?? ""}`}>{status}</span>;
}

const STATUSES: Array<Car["status"] | "all"> = ["all", "active", "pending", "hidden", "sold"];

export default function Listings() {
  const { cars, updateCarStatus, deleteCar } = useAdmin();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Car["status"] | "all">("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = cars.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || `${c.brand} ${c.model} ${c.location} ${c.seller.name}`.toLowerCase().includes(q);
    const matchS = statusFilter === "all" || c.status === statusFilter;
    return matchQ && matchS;
  });

  function handleDelete(id: string) {
    if (confirmDelete === id) { deleteCar(id); setConfirmDelete(null); }
    else { setConfirmDelete(id); setTimeout(() => setConfirmDelete(null), 3000); }
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Listings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{cars.length} total listings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by car, seller, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-card border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex gap-1 bg-card border border-input rounded-lg p-1">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize cursor-pointer ${statusFilter === s ? "bg-[#0EB5CA] text-white" : "text-muted-foreground hover:text-foreground"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl shadow-sm border border-card-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wide border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3">Car</th>
                <th className="text-left px-4 py-3">Seller</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Location</th>
                <th className="text-left px-4 py-3">Views</th>
                <th className="text-left px-4 py-3">Listed</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-muted-foreground">No listings match your filter.</td></tr>
              )}
              {filtered.map(car => (
                <tr key={car.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={car.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-muted" onError={e => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/40"; }} />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-foreground">{car.brand} {car.model}</p>
                          {car.isSponsored && <Star size={11} className="text-amber-500 fill-amber-400" />}
                        </div>
                        <p className="text-xs text-muted-foreground">{car.year} · {car.condition}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-muted-foreground">{car.seller.name}</span>
                    {car.seller.isVerified && <span className="ml-1 text-[10px] text-[#0EB5CA]">✓</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{formatPrice(car.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{car.location}</td>
                  <td className="px-4 py-3 text-muted-foreground">{car.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(car.createdAt)}</td>
                  <td className="px-4 py-3"><StatusBadge status={car.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {car.status === "pending" && (
                        <button onClick={() => updateCarStatus(car.id, "active")} title="Approve" className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors cursor-pointer">
                          <CheckCircle size={15} />
                        </button>
                      )}
                      {car.status === "active" ? (
                        <button onClick={() => updateCarStatus(car.id, "hidden")} title="Hide" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer">
                          <EyeOff size={15} />
                        </button>
                      ) : car.status === "hidden" ? (
                        <button onClick={() => updateCarStatus(car.id, "active")} title="Unhide" className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 transition-colors cursor-pointer">
                          <Eye size={15} />
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleDelete(car.id)}
                        title={confirmDelete === car.id ? "Click again to confirm" : "Delete"}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${confirmDelete === car.id ? "bg-red-100 text-red-700 ring-1 ring-red-300" : "hover:bg-red-100 text-red-500"}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
          Showing {filtered.length} of {cars.length} listings
        </div>
      </div>
    </div>
  );
}
