import { useEffect, useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { fetchDiscoveryFeed } from "../../api/client";

// Hardcoded for now — will come from auth later
const VIEWER_ID = "55a8902a-85a0-4f09-b819-16fdb17dc452";

export function DiscoveryFeed() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscoveryFeed(VIEWER_ID)
      .then((data) => setProfiles(data.profiles))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-muted)",
        }}
      >
        Finding people for you...
      </div>
    );

  if (error)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--accent)",
        }}
      >
        Something went wrong. Make sure the backend is running.
      </div>
    );

  if (profiles.length === 0)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-muted)",
        }}
      >
        <h3 style={{ fontFamily: "var(--font-display)", marginBottom: "8px" }}>
          You're all caught up
        </h3>
        <p>New profiles appear daily. Come back tomorrow.</p>
      </div>
    );

  return (
    <div>
      {profiles.map((profile) => (
        <ProfileCard key={profile.id} profile={profile} viewerId={VIEWER_ID} />
      ))}
    </div>
  );
}
