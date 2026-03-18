"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface FollowCommunityButtonProps {
  slug: string;
  communityId: string;
}

export function FollowCommunityButton({ slug }: FollowCommunityButtonProps) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch(`/api/communities/${slug}/follow`, { method: "GET" })
      .then((r) => r.json())
      .then((d) => { if (typeof d.following === "boolean") setFollowing(d.following); })
      .catch(() => {});
  }, [session, slug]);

  if (!session?.user) return null;

  async function handleToggle() {
    setLoading(true);
    setFollowing(!following); // optimistic
    try {
      const res = await fetch(`/api/communities/${slug}/follow`, {
        method: "POST",
      });
      const data = await res.json();
      if (typeof data.following === "boolean") {
        setFollowing(data.following);
      }
    } catch {
      setFollowing(!following); // revert
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
