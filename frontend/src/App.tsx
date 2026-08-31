import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth, useClerk, useUser } from "@clerk/react";
import Landing from "./pages/Landing";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StrategyBuilder from "./pages/StrategyBuilder";
import Results from "./pages/Results";
import SavedStrategies from "./pages/SavedStrategies";
import Compare from "./pages/Compare";
import History from "./pages/History";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import ClerkAuthBridge from "./components/ClerkAuthBridge";
import SideRail from "./components/SideRail";
import TickerTape from "./components/TickerTape";

function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const email = user?.primaryEmailAddress?.emailAddress || "";

  const logout = async () => {
    sessionStorage.removeItem("lastResult");
    sessionStorage.removeItem("lastRequest");
    sessionStorage.removeItem("lastSweep");
    sessionStorage.removeItem("compareSelection");
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <>
      <SideRail
        userEmail={email}
        userName={user?.fullName || undefined}
        userImageUrl={user?.imageUrl || undefined}
        onLogout={logout}
      />
      <main className="page-shell"><TickerTape/><div className="content">{children}</div></main>
    </>
  );
}

function Protected({ children }: { children: ReactNode }) {
  return <ProtectedRoute><AuthenticatedLayout>{children}</AuthenticatedLayout></ProtectedRoute>;
}

export default function App() {
  return (
    <BrowserRouter>
      <ClerkAuthBridge />
      <Routes>
        <Route path="/" element={<Landing/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/signin" element={<SignIn/>}/>
        <Route path="/forgot-password" element={<ForgotPassword/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="/build" element={<Protected><StrategyBuilder/></Protected>}/>
        <Route path="/results" element={<Protected><Results/></Protected>}/>
        <Route path="/history" element={<Protected><History/></Protected>}/>
        <Route path="/compare" element={<Protected><Compare/></Protected>}/>
        <Route path="/saved" element={<Protected><SavedStrategies/></Protected>}/>
        <Route path="/profile" element={<Protected><Profile/></Protected>}/>
      </Routes>
    </BrowserRouter>
  );
}
