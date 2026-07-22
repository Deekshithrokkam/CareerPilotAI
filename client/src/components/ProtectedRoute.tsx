import { Navigate, Outlet } from "react-router-dom";
import { LoadingState } from "./ui";
import { useAuth } from "../lib/auth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingState label="Checking your session" />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
