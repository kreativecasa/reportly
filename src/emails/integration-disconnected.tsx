import * as React from "react";
import { Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./_components/layout";

export function IntegrationDisconnectedEmail({ integrationName, reconnectUrl }: { integrationName: string; reconnectUrl: string }) {
  return (
    <EmailLayout preview={`Your ${integrationName} connection needs attention`}>
      <Text style={{ fontSize: 18, fontWeight: 600 }}>Action required</Text>
      <Text style={{ color: "#334155", lineHeight: 1.6 }}>
        Your <strong>{integrationName}</strong> connection has expired or been revoked. Reconnect to keep your reports up to date.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={reconnectUrl} style={{ backgroundColor: "#3475EF", color: "#fff", padding: "12px 24px", borderRadius: 999, fontWeight: 700, textDecoration: "none" }}>
          Reconnect now
        </Button>
      </Section>
    </EmailLayout>
  );
}
export default IntegrationDisconnectedEmail;
