"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";

export function ShareButton() {
  const [showToast, setShowToast] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const title = document.title;

    // Use Web Share API on mobile if available
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (err) {
        // User cancelled or share failed — fall through to clipboard
        if ((err as Error).name === "AbortError") return;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setShowToast(true);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
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
