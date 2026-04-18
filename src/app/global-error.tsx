"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: 520, margin: "4rem auto" }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Something went wrong</h1>
        <p style={{ color: "#475569", marginBottom: 20 }}>
          We&apos;ve been notified and will take a look. In the meantime, you can try again.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#3475EF",
            color: "#fff",
            border: 0,
            padding: "10px 20px",
            borderRadius: 999,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
