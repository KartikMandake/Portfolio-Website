import { useState, useEffect } from "react";

const SESSION_KEY = "cb_admin";

/**
 * useAdminMode
 *
 * Two-step flow:
 *  1. Trigger (URL param ?admin, or Ctrl+Shift+A) → shows password modal
 *  2. Correct password verified via SHA-256 (Web Crypto) → grants isAdmin
 *
 * Admin state lives in sessionStorage — persists on refresh, gone when tab closes.
 */
export default function useAdminMode() {
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // ── Trigger 1: URL param (?admin)
    const params = new URLSearchParams(window.location.search);
    if (params.has("admin")) {
      setShowModal(true);
      // Clean ?admin out of the address bar silently
      const clean = window.location.pathname + window.location.hash;
      window.history.replaceState(null, "", clean);
    }

    // ── Trigger 2: Ctrl + Shift + A
    const handleKey = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        setShowModal(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function onAuthSuccess() {
    sessionStorage.setItem(SESSION_KEY, "1");
    setIsAdmin(true);
    setShowModal(false);
  }

  function onModalClose() {
    setShowModal(false);
  }

  function deactivate() {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAdmin(false);
  }

  return { isAdmin, showModal, onAuthSuccess, onModalClose, deactivate };
}
