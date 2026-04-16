import * as React from "react";
import { Text, Button, Section, Hr } from "@react-email/components";
import { EmailLayout } from "./_components/layout";

export function ClientReportEmail({
  reportTitle,
  workspaceName,
  clientName,
  message,
  shareUrl,
  pdfUrl,
}: {
  reportTitle: string;
  workspaceName: string;
  clientName: string;
  message?: string;
  shareUrl: string;
  pdfUrl: string | null;
}) {
  return (
    <EmailLayout preview={`${reportTitle} — your report from ${workspaceName}`}>
      <Text style={{ fontSize: 18, fontWeight: 600 }}>Hi {clientName},</Text>
      <Text style={{ color: "#334155", lineHeight: 1.6 }}>
        Your report <strong>{reportTitle}</strong> is ready. Click below to view it.
      </Text>
      {message && (
        <>
          <Hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />
          <Text style={{ color: "#334155", fontStyle: "italic" }}>{message}</Text>
          <Hr style={{ borderColor: "#e2e8f0", margin: "20px 0" }} />
        </>
      )}
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={shareUrl} style={{ backgroundColor: "#3475EF", color: "#fff", padding: "12px 24px", borderRadius: 999, fontWeight: 700, textDecoration: "none" }}>
          View report online
        </Button>
      </Section>
      {pdfUrl && (
        <Text style={{ fontSize: 13, color: "#64748b", textAlign: "center" }}>
          Or download the PDF: <a href={pdfUrl} style={{ color: "#3475EF" }}>download</a>
        </Text>
      )}
      <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 24 }}>
        Sent via Reportly on behalf of {workspaceName}.
      </Text>
    </EmailLayout>
  );
}
export default ClientReportEmail;
