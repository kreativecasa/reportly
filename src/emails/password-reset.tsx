import * as React from "react";
import { Button, Text, Section } from "@react-email/components";
import { EmailLayout } from "./_components/layout";

export function PasswordResetEmail({ resetUrl }: { resetUrl: string }) {
  return (
    <EmailLayout preview="Reset your Reportly password">
      <Text style={{ fontSize: 18, fontWeight: 600, color: "#0f172a" }}>Reset your password</Text>
      <Text style={{ color: "#334155", lineHeight: 1.6 }}>
        Someone requested a password reset for your Reportly account. Click the button below to choose a new password.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button
          href={resetUrl}
          style={{
            backgroundColor: "#3B82F6",
            color: "#ffffff",
            padding: "12px 24px",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Reset password
        </Button>
      </Section>
      <Text style={{ fontSize: 13, color: "#64748b" }}>
        Or paste this link into your browser: {resetUrl}
      </Text>
      <Text style={{ fontSize: 13, color: "#64748b" }}>
        This link expires in 1 hour. If you didn&apos;t request this, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}

export default PasswordResetEmail;
