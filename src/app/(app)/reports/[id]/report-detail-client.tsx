"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReportView, type ReportSection } from "@/components/report/report-view";

interface Props {
  reportId: string;
  initialStatus: string;
  initialSections: ReportSection[];
  title: string;
  client: { name: string };
  workspace: { name: string; brandColor: string; logoUrl: string | null };
  dateRange: { start: string; end: string };
  pdfUrl: string | null;
  shareToken: string;
  defaultSendEmail: string | null;
  errorMessage: string | null;
}

export function ReportDetailClient(props: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(props.initialStatus);
  const [sections, setSections] = useState<ReportSection[]>(props.initialSections);
  const [pdfUrl, setPdfUrl] = useState(props.pdfUrl);
  const [errorMessage, setErrorMessage] = useState<string | null>(props.errorMessage);
  const [sendModal, setSendModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Poll for status while generating
  useEffect(() => {
    if (status !== "GENERATING") return;
    let active = true;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/reports/${props.reportId}/status`);
      const json = await res.json();
      if (!active || !json.success) return;
      setStatus(json.data.status);
      if (json.data.status === "READY" || json.data.status === "ERROR") {
        if (json.data.status === "ERROR") setErrorMessage(json.data.errorMessage);
        clearInterval(interval);
        // Refetch full report for sections
        const r = await fetch(`/api/reports/${props.reportId}`).then((x) => x.json());
        if (r.success && r.data?.report) {
          setSections((r.data.report.sections as ReportSection[]) ?? []);
          setPdfUrl(r.data.report.pdfUrl);
        }
        router.refresh();
      }
    }, 3000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [status, props.reportId, router]);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/r/${props.shareToken}`
    : "";

  async function copyShare() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (status === "GENERATING") {
    return (
      <div className="stappli-card p-16 text-center">
        <div className="inline-block w-12 h-12 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mb-6" />
        <h1 className="stappli-title mb-2">Generating your report…</h1>
        <p className="stappli-subtitle">
          Fetching data, analysing performance, writing insights. Usually takes 30–60 seconds.
        </p>
      </div>
    );
  }

  if (status === "ERROR") {
    return (
      <div className="stappli-card p-10">
        <h1 className="stappli-title mb-2">Something went wrong</h1>
        <p className="stappli-subtitle mb-4">{errorMessage ?? "Report generation failed."}</p>
        <div className="flex gap-3">
          <button onClick={() => router.push("/reports/new")} className="stappli-button-primary">
            Start over
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="stappli-title">{props.title}</h1>
          <p className="stappli-subtitle mt-1">
            {props.client.name} · {props.dateRange.start} – {props.dateRange.end}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={copyShare} className="stappli-button-ghost">
            {copied ? "Copied!" : "Copy share link"}
          </button>
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="stappli-button-ghost">
              Download PDF
            </a>
          )}
          <button onClick={() => setSendModal(true)} className="stappli-button-primary">
            Send to client
          </button>
        </div>
      </div>

      <div className="stappli-card overflow-hidden">
        <ReportView
          brandColor={props.workspace.brandColor}
          workspaceName={props.workspace.name}
          workspaceLogoUrl={props.workspace.logoUrl}
          clientName={props.client.name}
          title={props.title}
          dateRangeStart={props.dateRange.start}
          dateRangeEnd={props.dateRange.end}
          sections={sections}
        />
      </div>

      {sendModal && (
        <SendModal
          reportId={props.reportId}
          defaultEmail={props.defaultSendEmail ?? ""}
          onClose={() => setSendModal(false)}
          onSent={() => {
            setSendModal(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function SendModal({
  reportId,
  defaultEmail,
  onClose,
  onSent,
}: {
  reportId: string;
  defaultEmail: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [to, setTo] = useState(defaultEmail);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/reports/${reportId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toEmail: to, message: message || undefined }),
    });
    const json = await res.json();
    setLoading(false);
    if (!json.success) {
      setError(json.error?.message ?? "Send failed");
      return;
    }
    onSent();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="stappli-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-1">Send report</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Your client will receive an email with a link to the report.</p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
              Recipient email
            </label>
            <input type="email" className="stappli-input" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))] mb-2">
              Message (optional)
            </label>
            <textarea rows={3} className="stappli-input h-auto py-3" value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>
          {error && <p className="text-sm text-[hsl(var(--destructive))]">{error}</p>}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="stappli-button-ghost flex-1">Cancel</button>
          <button onClick={send} disabled={loading || !to} className="stappli-button-primary flex-1">
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
