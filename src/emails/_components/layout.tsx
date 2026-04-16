import * as React from "react";
import { Html, Head, Body, Container, Text, Hr, Preview } from "@react-email/components";

const body: React.CSSProperties = {
  backgroundColor: "#f6f7f9",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  margin: 0,
  padding: "24px 0",
};
const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: 12,
  maxWidth: 560,
  margin: "0 auto",
  padding: 32,
};
const brand: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 24,
};
const footer: React.CSSProperties = {
  fontSize: 12,
  color: "#64748b",
  marginTop: 24,
  lineHeight: 1.5,
};

export function EmailLayout({ preview, children }: { preview: string; children: React.ReactNode }) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Text style={brand}>Reportly</Text>
          {children}
          <Hr style={{ borderColor: "#e2e8f0", margin: "24px 0" }} />
          <Text style={footer}>
            Reportly · AI-powered client reports for agencies and freelancers.
            <br />
            You received this email because of activity on your account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
