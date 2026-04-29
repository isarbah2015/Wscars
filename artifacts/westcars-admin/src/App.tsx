import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminProvider } from "@/context/AdminContext";
import { Sidebar } from "@/components/Sidebar";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Listings from "@/pages/Listings";
import Users from "@/pages/Users";
import Reports from "@/pages/Reports";
import Analytics from "@/pages/Analytics";

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl font-black text-[#0EB5CA]">404</p>
        <p className="mt-2 text-muted-foreground">Page not found</p>
      </div>
    </div>
  );
}

function AdminApp({ onLogout }: { onLogout: () => void }) {
  // AdminProvider lives INSIDE the authed shell so its Firestore
  // subscriptions only fire after a successful admin login. Otherwise
  // unauthenticated reads trip the security rules (permission-denied).
  return (
    <AdminProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/listings" component={Listings} />
            <Route path="/users" component={Users} />
            <Route path="/reports" component={Reports} />
            <Route path="/analytics" component={Analytics} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </AdminProvider>
  );
}

function App() {
  const [authed, setAuthed] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        {authed
          ? <AdminApp onLogout={() => setAuthed(false)} />
          : <Login onLogin={() => setAuthed(true)} />
        }
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
