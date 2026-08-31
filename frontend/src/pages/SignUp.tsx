import { SignUp as ClerkSignUp } from "@clerk/react";

export default function SignUp() {
  return (
    <div className="auth-page">
      <div className="clerk-auth-shell">
        <ClerkSignUp routing="hash" fallbackRedirectUrl="/build" />
      </div>
    </div>
  );
}
