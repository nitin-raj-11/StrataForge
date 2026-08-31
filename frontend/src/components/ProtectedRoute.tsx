import { useAuth } from "@clerk/react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="page-loading">Loading your workspace…</div>;
  return isSignedIn ? <>{children}</> : <Navigate to="/signin" replace />;
}
