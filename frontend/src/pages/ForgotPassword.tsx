import { SignIn as ClerkSignIn } from "@clerk/react";

export default function ForgotPassword() {
  return (
    <div className="auth-page">
      <div className="clerk-auth-shell">
        <p className="clerk-auth-note">Use the “Forgot password?” link below. Clerk will send a password reset code to the account email.</p>
        <ClerkSignIn routing="hash" fallbackRedirectUrl="/build" />
      </div>
    </div>
  );
}
