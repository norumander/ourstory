"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

export function ShareButton() {
  const [showToast, setShowToast] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowToast(true);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowToast(true);
    }
  }, []);

  return (
    <>
      <Button variant="outline" className="w-full" size="lg" onClick={handleShare}>
        Share
      </Button>
      {showToast && (
        <Toast
          message="Link copied to clipboard!"
          variant="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
