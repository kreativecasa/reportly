"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F9F8] px-4">
      <div className="stappli-card p-10 max-w-md w-full text-center">
        <h1 className="stappli-title mb-2">Something went wrong</h1>
        <p className="stappli-subtitle mb-6">An unexpected error occurred. Please try again.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="stappli-button-primary">
            Try again
          </button>
          <Link href="/" className="stappli-button-ghost">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
