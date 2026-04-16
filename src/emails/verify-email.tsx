import * as React from "react";
import { Button, Text, Section } from "@react-email/components";
import { EmailLayout } from "./_components/layout";

export function VerifyEmail({ name, verifyUrl }: { name?: string; verifyUrl: string }) {
  return (
    <EmailLayout preview="Verify your Reportly email address">
      <Text style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}>
        {name ? `Hi ${name},` : "Hi there,"}
      </Text>
      <Text style={{ color: "#334155", lineHeight: 1.6 }}>
        Please confirm your email address to finish setting up your Reportly account.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button
          href={verifyUrl}
          style={{
            backgroundColor: "#3B82F6",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Verify email address
        </Button>
      </Section>
      <Text style={{ fontSize: 13, color: "#64748b" }}>
        Or paste this link into your browser: {verifyUrl}
      </Text>
      <Text style={{ fontSize: 13, color: "#64748b" }}>
        This link expires in 24 hours. If you didn&apos;t sign up for Reportly, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}

export default VerifyEmail;
