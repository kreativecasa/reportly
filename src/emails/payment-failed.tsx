import * as React from "react";
import { Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./_components/layout";

export function PaymentFailedEmail({ billingUrl }: { billingUrl: string }) {
  return (
    <EmailLayout preview="Action required: payment failed">
      <Text style={{ fontSize: 18, fontWeight: 600, color: "#b91c1c" }}>Payment failed</Text>
      <Text style={{ color: "#334155", lineHeight: 1.6 }}>
        We couldn&apos;t process your latest Reportly payment. Please update your payment method to keep your subscription active.
      </Text>
      <Section style={{ textAlign: "center", margin: "32px 0" }}>
        <Button href={billingUrl} style={{ backgroundColor: "#3475EF", color: "#fff", padding: "12px 24px", borderRadius: 999, fontWeight: 700, textDecoration: "none" }}>
          Update payment
        </Button>
      </Section>
    </EmailLayout>
  );
}
export default PaymentFailedEmail;
