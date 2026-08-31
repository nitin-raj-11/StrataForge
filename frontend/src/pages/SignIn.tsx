import { SignIn as ClerkSignIn } from "@clerk/react";

export default function SignIn() {
  return (
    <div className="auth-page">
      <div className="clerk-auth-shell">
        <ClerkSignIn routing="hash" fallbackRedirectUrl="/build" />
      </div>
    </div>
  );
}
