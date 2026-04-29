import { Link, useLocation } from "wouter";
import { LayoutDashboard, Car, Users, Flag, LogOut, ChevronRight, BarChart2 } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/listings", label: "Listings", icon: Car },
  { href: "/users", label: "Users", icon: Users },
  { href: "/reports", label: "Reports", icon: Flag },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const [location] = useLocation();
  const { cars, users, reports } = useAdmin();

  const pendingListings = cars.filter(c => c.status === "pending").length;
  const openReports = reports.filter(r => r.status === "open").length;

  return (
    <aside className="w-60 flex-shrink-0 flex flex-col h-screen bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0EB5CA] flex items-center justify-center text-white font-bold text-sm">W</div>
          <div>
            <p className="text-white font-bold text-sm leading-tight tracking-wide">WESTCARS</p>
            <p className="text-white/50 text-[10px] leading-tight">Admin Dashboard</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/" && location.startsWith(href));
          const badge = href === "/listings" ? pendingListings : href === "/reports" ? openReports : 0;
          return (
            <Link key={href} href={href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${active ? "bg-[#0EB5CA]/20 text-white" : "text-white/65 hover:text-white hover:bg-white/8"}`}>
                <Icon size={17} className={active ? "text-[#0EB5CA]" : "group-hover:text-white/90"} />
                <span className="flex-1 text-sm font-medium">{label}</span>
                {badge > 0 && (
                  <span className="text-[10px] font-bold bg-[#0EB5CA] text-white px-1.5 py-0.5 rounded-full leading-none">{badge}</span>
                )}
                {active && <ChevronRight size={13} className="text-[#0EB5CA]" />}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <div className="px-3 py-2 rounded-lg bg-white/5">
          <p className="text-[11px] text-white/50 leading-tight">Signed in as</p>
          <p className="text-sm font-semibold text-white leading-tight mt-0.5">admin@westcars.gh</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/8 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
