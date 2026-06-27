import { useState, useRef, useEffect } from "react";

interface AudioPlayerProps {
  duration: number; // in seconds
  onComplete: () => void;
  onProgress: (progress: number) => void;
}

export function AudioPlayer({
  duration,
  onComplete,
  onProgress,
}: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<number | null>(null);

  // Simulate audio playback — replace with real Audio element when audio_url exists
  useEffect(() => {
    if (playing) {
      intervalRef.current = window.setInterval(() => {
        setProgress((prev) => {
          const next = prev + 1 / duration;
          onProgress(Math.min(next, 1));
          if (next >= 1) {
            setPlaying(false);
            setCompleted(true);
            onComplete();
            clearInterval(intervalRef.current!);
            return 1;
          }
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, duration]);

  const bars = Array.from({ length: 28 }, (_, i) => {
    const heights = [
      40, 55, 35, 70, 50, 80, 45, 60, 75, 40, 65, 50, 85, 45, 70, 55, 40, 75,
      50, 65, 35, 80, 60, 45, 70, 55, 40, 65,
    ];
    return heights[i % heights.length];
  });

  const filledBars = Math.floor(progress * bars.length);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        cursor: "pointer",
      }}
    >
      {/* Play/pause button */}
      <button
        onClick={() => (!completed ? setPlaying((p) => !p) : null)}
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          background: completed ? "var(--success)" : "var(--accent)",
          border: "none",
          cursor: completed ? "default" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 0.3s ease",
        }}
      >
        {completed ? (
          <span style={{ color: "white", fontSize: "18px" }}>✓</span>
        ) : playing ? (
          <span style={{ color: "white", fontSize: "14px" }}>⏸</span>
        ) : (
          <span style={{ color: "white", fontSize: "14px", marginLeft: "2px" }}>
            ▶
          </span>
        )}
      </button>

      {/* Waveform */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "3px",
          height: "40px",
        }}
      >
        {bars.map((height, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${height}%`,
              borderRadius: "2px",
              background:
                i < filledBars
                  ? completed
                    ? "var(--success)"
                    : "var(--accent)"
                  : "var(--border)",
              transition: playing ? "background 0.1s ease" : "none",
              animation:
                playing && Math.abs(i - filledBars) < 3
                  ? "pulse 0.4s ease infinite alternate"
                  : "none",
            }}
          />
        ))}
      </div>

      {/* Duration */}
      <span
        style={{
          fontSize: "12px",
          color: "var(--text-muted)",
          flexShrink: 0,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {completed ? "Listened" : `${duration}s`}
      </span>

      <style>{`
        @keyframes pulse {
          from { transform: scaleY(0.7); }
          to { transform: scaleY(1.1); }
        }
      `}</style>
    </div>
  );
}
