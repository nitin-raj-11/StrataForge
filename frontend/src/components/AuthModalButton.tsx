import type { ReactNode } from "react";
import { useClerk } from "@clerk/react";

type AuthModalButtonProps = {
  mode: "signIn" | "signUp";
  children: ReactNode;
  className?: string;
};

export default function AuthModalButton({ mode, children, className }: AuthModalButtonProps) {
  const clerk = useClerk();

  const open = () => {
    if (mode === "signIn") {
      clerk.openSignIn({ fallbackRedirectUrl: "/build" });
      return;
    }

    clerk.openSignUp({ fallbackRedirectUrl: "/build" });
  };

  return (
    <button type="button" className={className} onClick={open}>
      {children}
    </button>
  );
}
