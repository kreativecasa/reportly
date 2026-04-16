import * as React from "react";
import { Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./_components/layout";

export function TrialEndingEmail({ daysLeft, upgradeUrl }: { daysLeft: number; upgradeUrl: string }) {
  return (
    <EmailLayout preview={`Your Reportly trial ends in ${daysLeft} days`}>
      <Text style={{ fontSize: 18, fontWeight: 600 }}>Your trial ends in {daysLeft} days</Text>
      <Text style={{ color: "#334155", lineHeight: 1.6 }}>
        Keep the reports flowing. Upgrade to Reportly to stay on after your trial ends.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={upgradeUrl} style={{ backgroundColor: "#3475EF", color: "#fff", padding: "12px 24px", borderRadius: 999, fontWeight: 700, textDecoration: "none" }}>
          Upgrade now
        </Button>
      </Section>
    </EmailLayout>
  );
}
export default TrialEndingEmail;
