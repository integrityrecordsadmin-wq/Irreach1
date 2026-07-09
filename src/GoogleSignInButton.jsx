// src/GoogleSignInButton.jsx
//
// A reusable "Sign in with Google" button. On click, opens a Google
// popup, and on success calls onSignIn with a simple user object:
// { id, name, email, photoUrl }
//
// Usage:
//   <GoogleSignInButton onSignIn={(user) => setCurrentUser(user)} />

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebaseConfig";

export default function GoogleSignInButton({ onSignIn, label = "Continue with Google" }) {
  const handleClick = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;

      const user = {
        id: u.uid,
        name: u.displayName || "",
        email: u.email || "",
        photoUrl: u.photoURL || "",
      };

      if (onSignIn) onSignIn(user);
    } catch (err) {
      console.error("Google sign-in failed:", err);
      // Common cause: popup blocked, or user closed the popup.
      alert("Sign-in was cancelled or failed. Please try again.");
    }
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        width: "100%",
        padding: "12px 20px",
        borderRadius: 999,
        border: "1px solid #DDD",
        background: "#FFFFFF",
        color: "#1F1F1F",
        fontWeight: 600,
        fontSize: 14.5,
        cursor: "pointer",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.8 2.73v2.27h2.92c1.71-1.57 2.68-3.88 2.68-6.64z"/>
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33C2.44 15.98 5.48 18 9 18z"/>
        <path fill="#FBBC05" d="M3.97 10.7c-.18-.54-.28-1.11-.28-1.7s.1-1.16.28-1.7V4.97H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.03l3.01-2.33z"/>
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.97l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
      </svg>
      {label}
    </button>
  );
}
