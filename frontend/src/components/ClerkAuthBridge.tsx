import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { setClerkTokenGetter } from "../api/client";

export default function ClerkAuthBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setClerkTokenGetter(getToken);
    return () => setClerkTokenGetter(null);
  }, [getToken]);

  return null;
}
