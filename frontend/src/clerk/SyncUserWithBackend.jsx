// src/clerk/SyncUserWithBackend.jsx
import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";

const SyncUserWithBackend = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    const sendUserToBackend = async () => {
      if (isLoaded && isSignedIn && user) {
        const userData = {
          clerkUserId: user.id,
          fullName: user.fullName || user.username || "N/A",
          email: user.primaryEmailAddress?.emailAddress,
        };

        console.log("📡 Sending to backend:", userData);

        try {
          const res = await fetch("http://localhost:5000/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          const result = await res.json();

          if (res.ok) {
            console.log("✅ Backend saved:", result);
          } else {
            console.warn("❌ Backend failed:", result);
          }
        } catch (err) {
          console.error("🚨 Network error:", err);
        }
      }
    };

    sendUserToBackend();
  }, [isLoaded, isSignedIn, user, getToken]);

  return null;
};

export default SyncUserWithBackend;
