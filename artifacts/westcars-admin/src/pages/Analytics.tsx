import { useAdmin } from "@/context/AdminContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatPrice } from "@/data/mock";

const TEAL = "#0EB5CA";
const COLORS = [TEAL, "#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6"];

export default function Analytics() {
  const { cars, users } = useAdmin();

  const byCategory = Object.entries(
    cars.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const byLocation = Object.entries(
    cars.reduce((acc, c) => { acc[c.location] = (acc[c.location] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const byCondition = Object.entries(
    cars.reduce((acc, c) => { acc[c.condition] = (acc[c.condition] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const top5Views = [...cars].sort((a, b) => b.views - a.views).slice(0, 5);

  const usersByLocation = Object.entries(
    users.reduce((acc, u) => { acc[u.location] = (acc[u.location] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Marketplace insights</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Listings by category */}
        <div className="bg-card rounded-xl border border-card-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Listings by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byCategory} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} width={24} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="value" fill={TEAL} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Condition split */}
        <div className="bg-card rounded-xl border border-card-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Condition Split</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={byCondition} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {byCondition.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 by views */}
        <div className="bg-card rounded-xl border border-card-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Top 5 Most Viewed</h2>
          <div className="space-y-3">
            {top5Views.map((car, i) => (
              <div key={car.id} className="flex items-center gap-3">
                <span className="w-5 text-xs text-muted-foreground font-mono text-right">{i + 1}.</span>
                <img src={car.images[0]} alt="" className="w-8 h-8 rounded object-cover bg-muted" onError={e => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/32"; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{car.brand} {car.model}</p>
                  <p className="text-xs text-muted-foreground">{formatPrice(car.price)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{car.views.toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground">views</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Listings by location */}
        <div className="bg-card rounded-xl border border-card-border p-5">
          <h2 className="font-semibold text-foreground mb-4">Listings by Location</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byLocation} layout="vertical" barSize={20}>
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#94a3b8" }} width={70} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="value" fill="#6366F1" radius={[0, 5, 5, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
