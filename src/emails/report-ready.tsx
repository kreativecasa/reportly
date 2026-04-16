import * as React from "react";
import { Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./_components/layout";

export function ReportReadyEmail({ clientName, reportTitle, viewUrl }: { clientName: string; reportTitle: string; viewUrl: string }) {
  return (
    <EmailLayout preview={`Your ${clientName} report is ready`}>
      <Text style={{ fontSize: 18, fontWeight: 600 }}>Your report is ready</Text>
      <Text style={{ color: "#334155", lineHeight: 1.6 }}>
        <strong>{reportTitle}</strong> for {clientName} has finished generating. Review it, make any edits, and send it to your client.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={viewUrl} style={{ backgroundColor: "#3475EF", color: "#fff", padding: "12px 24px", borderRadius: 999, fontWeight: 700, textDecoration: "none" }}>
          Open report
        </Button>
      </Section>
    </EmailLayout>
  );
}
export default ReportReadyEmail;
