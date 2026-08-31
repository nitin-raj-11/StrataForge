# StrataForge + Clerk Setup

StrataForge now uses Clerk as the authentication provider. Clerk owns user sessions, email verification, Google OAuth, password recovery, profile data, profile pictures, and password changes. The StrataForge database continues to own strategies, backtests, trades, and user-owned application records.

## 1. Create a Clerk application

Create a Clerk application and copy its publishable key and secret key.

The React SDK used by this project is `@clerk/react` 6.14.7.

## 2. Configure authentication in Clerk

In the Clerk Dashboard, enable:

- Email sign-up and sign-in
- Password sign-up/sign-in
- Email verification
- Password reset by email
- Google as a social connection
- First name and last name as editable profile fields

For Google in a production Clerk instance, configure your Google OAuth credentials in the Clerk Dashboard/Google Cloud flow. Development Clerk instances can use Clerk's preconfigured Google credentials.

## 3. Frontend environment

Create `frontend/.env.local`:

```env
VITE_API_URL=/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
```

Never put `CLERK_SECRET_KEY` in the frontend.

## 4. Backend environment

Set these variables for the Spring Boot backend:

```env
CLERK_SECRET_KEY=sk_test_your_key_here
CLERK_ISSUER_URL=https://your-instance.clerk.accounts.dev
CLERK_JWKS_URL=https://your-instance.clerk.accounts.dev/.well-known/jwks.json
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

For production, replace the issuer/JWKS host with your production Clerk Frontend API/custom domain as configured in Clerk.

## 5. Install the frontend dependency

From `frontend/` run:

```bash
npm install
```

Because the execution environment used to modify this project could not reach the npm registry, the package lock could not be regenerated here. `npm install` will refresh `frontend/package-lock.json` with `@clerk/react` 6.14.7 before deployment.

## 6. Password recovery flow

The Sign In screen is backed by Clerk's prebuilt SignIn component. Clicking `Forgot password?` starts Clerk's password-reset flow. Clerk sends a reset code to the user's email, verifies the code, accepts a new password, and signs the user in.

The old StrataForge SMTP/password-reset implementation has been removed from application code. The old database table is left harmlessly in the schema for existing databases; it is no longer used.

## 7. Profile page

The new `/profile` page lets signed-in users:

- Edit first name
- Edit last name
- Upload a new profile picture
- View their primary email address
- Change their password

The password form sends the current password to Clerk. Clerk only accepts the password change when the current password is valid. The UI also requests signing out of other sessions after a successful password change.

Google-only users are shown an explanation instead of a fake current-password form, because Google-managed accounts may not have a Clerk password.

## 8. Existing StrataForge users

The database keeps the existing `app_user.id` so strategies and backtest history do not need to be rewritten.

On the first authenticated API request from a Clerk user, the backend:

1. Reads the verified Clerk user ID from the JWT `sub` claim.
2. Looks for an existing local `app_user.clerk_user_id`.
3. If not found, fetches the Clerk user's verified profile from the Clerk Backend API.
4. If a local user already exists with the same email, links that row to the Clerk user ID so existing strategies/history are preserved.
5. Otherwise, creates a new local user row.

## 9. Important security behavior

The browser never stores a StrataForge-issued JWT anymore. Axios asks Clerk for the current session token and sends it as `Authorization: Bearer <token>`.

The Spring backend validates the Clerk token signature and issuer using Clerk's JWKS before protected controllers execute.

`CLERK_SECRET_KEY` is server-only and must never be exposed to Vite/browser code.
