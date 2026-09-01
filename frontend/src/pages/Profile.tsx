import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/react";
import { inputStyle, buttonStyle } from "../styles/formStyles";

function clerkError(error: any, fallback: string) {
  return error?.errors?.[0]?.longMessage || error?.errors?.[0]?.message || error?.message || fallback;
}

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
  }, [user]);

  if (!isLoaded) return <div className="page-loading">Loading profile…</div>;
  if (!isSignedIn || !user) return null;

  const currentUser = user;
  const email = currentUser.primaryEmailAddress?.emailAddress || "";
  const hasPassword = Boolean(currentUser.passwordEnabled);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setSavingProfile(true);
    try {
      await currentUser.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      setProfileSuccess("Profile details updated.");
    } catch (error) {
      setProfileError(clerkError(error, "We couldn't update your profile."));
    } finally {
      setSavingProfile(false);
    }
  }

  async function uploadProfileImage(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProfileError("");
    setProfileSuccess("");
    setUploadingPhoto(true);
    try {
      await currentUser.setProfileImage({ file });
      setProfileSuccess("Profile picture updated.");
    } catch (error) {
      setProfileError(clerkError(error, "We couldn't update your profile picture."));
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!hasPassword) {
      setPasswordError("This account does not have a password. Sign in with Google is managed by Google.");
      return;
    }
    if (!oldPassword) {
      setPasswordError("Enter your current password first.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Your new password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await currentUser.updatePassword({ currentPassword: oldPassword, newPassword, signOutOfOtherSessions: true });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password changed successfully. Other sessions were signed out.");
    } catch (error) {
      setPasswordError(clerkError(error, "The current password is incorrect or the new password is not allowed."));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="page-heading-row">
        <div>
          <div className="eyebrow">Account</div>
          <h1>Your profile</h1>
          <p className="page-subtitle">Manage the details tied to your StrataForge account.</p>
        </div>
        <Link to="/build" className="button button-secondary">Back to research</Link>
      </div>

      <div className="profile-grid">
        <section className="surface profile-card">
          <div className="profile-identity">
            <img src={currentUser.imageUrl} alt="Profile" className="profile-avatar" />
            <div>
              <h2>{currentUser.fullName || "Your name"}</h2>
              <p>{email}</p>
            </div>
          </div>
          <label className="profile-upload">
            <span>{uploadingPhoto ? "Uploading…" : "Change profile picture"}</span>
            <input type="file" accept="image/*" onChange={uploadProfileImage} disabled={uploadingPhoto} />
          </label>
        </section>

        <form className="surface profile-card" onSubmit={saveProfile}>
          <div className="eyebrow">Personal details</div>
          <h2>Profile information</h2>
          <p className="form-note">These details are stored securely in Clerk and used across your account.</p>
          <div className="profile-form-grid">
            <div className="field"><label htmlFor="profile-first-name">First name</label><input id="profile-first-name" style={inputStyle} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" /></div>
            <div className="field"><label htmlFor="profile-last-name">Last name</label><input id="profile-last-name" style={inputStyle} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" /></div>
          </div>
          <div className="field"><label htmlFor="profile-email">Email</label><input id="profile-email" style={inputStyle} value={email} readOnly aria-readonly="true" /></div>
          {profileError && <p className="form-error" role="alert">{profileError}</p>}
          {profileSuccess && <div className="form-success" role="status">{profileSuccess}</div>}
          <button type="submit" disabled={savingProfile} style={buttonStyle}>{savingProfile ? "Saving…" : "Save profile"}</button>
        </form>

        <form className="surface profile-card profile-password-card" onSubmit={changePassword}>
          <div className="eyebrow">Security</div>
          <h2>Change password</h2>
          <p className="form-note">For security, your current password must be correct before the new password is accepted.</p>
          {!hasPassword ? (
            <div className="profile-security-note">This account currently uses Google or another external sign-in and does not have a password to change.</div>
          ) : (
            <>
              <div className="field"><label htmlFor="current-password">Current password</label><input id="current-password" style={inputStyle} type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} autoComplete="current-password" required /></div>
              <div className="profile-form-grid">
                <div className="field"><label htmlFor="new-password">New password</label><input id="new-password" style={inputStyle} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} required /></div>
                <div className="field"><label htmlFor="confirm-password">Confirm new password</label><input id="confirm-password" style={inputStyle} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} required /></div>
              </div>
              {passwordError && <p className="form-error" role="alert">{passwordError}</p>}
              {passwordSuccess && <div className="form-success" role="status">{passwordSuccess}</div>}
              <button type="submit" disabled={savingPassword} style={buttonStyle}>{savingPassword ? "Updating…" : "Change password"}</button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
