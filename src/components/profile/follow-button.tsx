"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface FollowUserButtonProps {
  username: string;
}

export function FollowUserButton({ username }: FollowUserButtonProps) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/profiles/${username}/follow`, { method: "GET" })
      .then((r) => r.json())
      .then((d) => { if (typeof d.following === "boolean") setFollowing(d.following); })
      .catch(() => {});
  }, [session, username]);

  if (!session?.user) return null;

  async function handleToggle() {
    setLoading(true);
    const wasFollowing = following;
    setFollowing(!wasFollowing); // optimistic
    try {
      const res = await fetch(`/api/profiles/${username}/follow`, {
        method: "POST",
      });
      const data = await res.json();
      if (typeof data.following === "boolean") {
        setFollowing(data.following);
      }
    } catch {
      setFollowing(wasFollowing); // proper revert
    }
    setLoading(false);
  }

  return (
    <Button
      variant={following ? "outline" : "primary"}
      onClick={handleToggle}
      disabled={loading}
    >
      {following ? "Following" : "Follow"}
    </Button>
  );
}
