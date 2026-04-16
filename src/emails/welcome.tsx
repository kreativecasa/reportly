import * as React from "react";
import { Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./_components/layout";

export function WelcomeEmail({ name, appUrl }: { name?: string; appUrl: string }) {
  return (
    <EmailLayout preview="Welcome to Reportly — let's generate your first report">
      <Text style={{ fontSize: 18, fontWeight: 600 }}>Welcome{name ? `, ${name}` : ""} 👋</Text>
      <Text style={{ color: "#334155", lineHeight: 1.6 }}>
        You&apos;re all set with a 14-day free trial. Next: add a client, connect Google Analytics, and generate your first AI-powered report in under a minute.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button
          href={`${appUrl}/dashboard`}
          style={{ backgroundColor: "#3475EF", color: "#fff", padding: "12px 24px", borderRadius: 999, fontWeight: 700, textDecoration: "none" }}
        >
          Go to dashboard
        </Button>
      </Section>
      <Text style={{ fontSize: 13, color: "#64748b" }}>Reply to this email if you have questions — we read everything.</Text>
    </EmailLayout>
  );
}

export default WelcomeEmail;
