"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function Content() {
  const status = useSearchParams().get("status");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  if (status === "success") {
    return (
      <div>
        <span className="stappli-badge-active mb-4">Verified</span>
        <h1 className="stappli-title mb-2 mt-4">Email verified</h1>
        <p className="stappli-subtitle mb-8">You&apos;re all set. You can now access all Reportly features.</p>
        <Link href="/dashboard" className="stappli-button-primary">
          Go to dashboard
        </Link>
      </div>
    );
  }

  if (status === "expired" || status === "invalid") {
    const label = status === "expired" ? "This verification link has expired." : "This verification link is invalid.";
    return (
      <div>
        <h1 className="stappli-title mb-2">Verification failed</h1>
        <p className="stappli-subtitle mb-8">{label} Enter your email to get a new one.</p>
        {sent ? (
          <p className="text-sm text-emerald-700">If an account exists for {email}, a new link has been sent.</p>
        ) : (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch("/api/auth/resend-verification", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
              });
              setSent(true);
            }}
            className="space-y-5"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="stappli-input"
            />
            <button type="submit" className="stappli-button-primary w-full">
              Resend verification link
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div>
      <h1 className="stappli-title mb-2">Check your email</h1>
      <p className="stappli-subtitle">
        We&apos;ve sent a verification link to your email. Click the link to activate your account.
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}
