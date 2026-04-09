import { Car as CarIcon, Users, Eye, TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { formatPrice, formatDate } from "@/data/mock";
import { Link } from "wouter";

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub: string; icon: any; color: string }) {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-card-border flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-muted-foreground text-xs font-medium">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    hidden: "bg-slate-100 text-slate-600",
    sold: "bg-blue-100 text-blue-700",
  };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>;
}

export default function Dashboard() {
  const { cars, users } = useAdmin();

  const totalViews = cars.reduce((s, c) => s + c.views, 0);
  const active = cars.filter(c => c.status === "active").length;
  const pending = cars.filter(c => c.status === "pending").length;
  const totalRevEst = cars.reduce((s, c) => s + c.price * 0.02, 0);

  const recentCars = [...cars].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Westcars marketplace overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Listings" value={cars.length} sub={`${active} active · ${pending} pending`} icon={CarIcon} color="bg-[#0EB5CA]" />
        <StatCard label="Registered Users" value={users.length} sub={`${users.filter(u => u.isVerified).length} verified`} icon={Users} color="bg-indigo-500" />
        <StatCard label="Total Views" value={totalViews.toLocaleString()} sub="Across all listings" icon={Eye} color="bg-emerald-500" />
        <StatCard label="Est. Revenue" value={`GHS ${Math.round(totalRevEst / 1000)}k`} sub="2% platform fee" icon={TrendingUp} color="bg-amber-500" />
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active listings", value: active, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50 border-green-100" },
          { label: "Pending review", value: pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          { label: "Open reports", value: 3, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 border-red-100" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`rounded-xl p-4 border flex items-center gap-3 ${bg}`}>
            <Icon size={20} className={color} />
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent listings table */}
      <div className="bg-card rounded-xl shadow-sm border border-card-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Recent Listings</h2>
          <Link href="/listings">
            <span className="text-sm text-[#0EB5CA] hover:underline cursor-pointer">View all</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground uppercase tracking-wide border-b border-border">
                <th className="text-left px-5 py-3">Car</th>
                <th className="text-left px-4 py-3">Seller</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Views</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Listed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentCars.map(car => (
                <tr key={car.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={car.images[0]} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 bg-muted" onError={e => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/36"; }} />
                      <div>
                        <p className="font-medium text-foreground">{car.brand} {car.model}</p>
                        <p className="text-xs text-muted-foreground">{car.year} · {car.condition}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{car.seller.name}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{formatPrice(car.price)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{car.views.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={car.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(car.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
