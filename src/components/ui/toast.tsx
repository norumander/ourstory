"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  variant?: "success" | "error" | "info";
  duration?: number;
  onClose: () => void;
}

const variantStyles = {
  success: "bg-success-600 text-white",
  error: "bg-error-600 text-white",
  info: "bg-warm-800 text-white",
};

export function Toast({
  message,
  variant = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 shadow-lg transition-all duration-300",
        variantStyles[variant],
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
