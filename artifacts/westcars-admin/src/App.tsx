import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { AdminProvider } from "@/context/AdminContext";
import { Sidebar } from "@/components/Sidebar";
import { auth, db, isFirebaseReady } from "@/lib/firebase";
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
  // `authed` mirrors Firebase Auth so login state survives Vite HMR reloads
  // and full page refreshes (otherwise users get bounced back to /login on
  // every code edit even though Firebase still has a valid session).
  //   null    → still resolving the persisted Firebase session (initial load)
  //   false   → no user, or signed-in user is not an admin
  //   true    → signed-in user with isAdmin: true
  const [authed, setAuthed] = useState<boolean | null>(
    isFirebaseReady() && auth ? null : false,
  );

  useEffect(() => {
    if (!isFirebaseReady() || !auth || !db) return;
    // `seq` guards against a stale async isAdmin lookup resolving AFTER a
    // newer auth-state event (e.g. fast sign-in/sign-out flips) and writing
    // out-of-date `authed` state.
    let seq = 0;
    const unsub = onAuthStateChanged(auth, async (user: User | null) => {
      const mySeq = ++seq;
      if (!user) {
        if (mySeq === seq) setAuthed(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db!, "users", user.uid));
        if (mySeq !== seq) return; // a newer auth event superseded us
        if (snap.exists() && (snap.data() as any).isAdmin === true) {
          setAuthed(true);
        } else {
          // Signed in but not an admin → drop them back to the login screen.
          await signOut(auth!).catch(() => {});
          if (mySeq === seq) setAuthed(false);
        }
      } catch (e) {
        console.warn("[admin] auth-state isAdmin check failed:", e);
        if (mySeq === seq) setAuthed(false);
      }
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    if (isFirebaseReady() && auth) {
      await signOut(auth).catch(() => {});
    }
    setAuthed(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        {authed === null
          ? (
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="w-10 h-10 border-4 border-[#0EB5CA] border-t-transparent rounded-full animate-spin" />
            </div>
          )
          : authed
            ? <AdminApp onLogout={handleLogout} />
            : <Login onLogin={() => setAuthed(true)} />
        }
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
