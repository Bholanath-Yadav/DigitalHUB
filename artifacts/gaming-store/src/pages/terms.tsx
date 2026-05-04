import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold mb-3 text-foreground">{title}</h2>
    <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">{children}</div>
  </div>
);

export default function TermsPage() {
  useSEO({
    title: "Terms & Conditions",
    description: "Read the Terms and Conditions for Digital HUB — Nepal's #1 digital gaming marketplace. Covers orders, payments, refunds and usage policies.",
    keywords: "digital hub terms and conditions nepal, gaming store terms nepal, digital hub nepal",
  });
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/40">
        <div className="container max-w-3xl px-4 md:px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center gap-3 mb-3"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Terms &amp; Conditions</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Last updated: May 2026</p>
            </div>
          </motion.div>
          <p className="text-sm text-muted-foreground">
            Please read these terms carefully before using Digital HUB Nepal. By accessing or placing an order, you agree to be bound by these terms.
          </p>
        </div>
      </div>

      {/* Body */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="container max-w-3xl px-4 md:px-6 py-10"
      >
        <Section title="1. About Digital HUB">
          <p>Digital HUB ("we", "us", or "our") is a digital goods marketplace based in Nepal, selling game top-ups, gift cards, subscription vouchers, and related digital products. Our services are available to customers within Nepal.</p>
        </Section>

        <Section title="2. Eligibility">
          <p>You must be at least 13 years old to use our services. By creating an account you confirm that the information you provide is accurate and that you have the authority to agree to these terms.</p>
        </Section>

        <Section title="3. Account Responsibility">
          <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity that occurs under your account is your responsibility. Notify us immediately at our WhatsApp support if you suspect unauthorised access.</p>
        </Section>

        <Section title="4. Ordering &amp; Payment">
          <p>All prices are listed in Nepalese Rupees (NPR). Orders are confirmed only after successful payment verification. We accept eSewa, Khalti, and IME Pay. Payment screenshots must be uploaded within 30 minutes of placing an order.</p>
          <p>We reserve the right to cancel orders if payment cannot be verified or if there is evidence of fraudulent activity.</p>
        </Section>

        <Section title="5. Delivery">
          <p>Digital products (top-up codes, vouchers, gift card keys) are delivered electronically to your registered email and account order page. Delivery times vary by product but are typically within 1–24 hours after payment confirmation.</p>
          <p>Digital HUB is not responsible for delays caused by third-party platforms (e.g. game servers, payment gateways).</p>
        </Section>

        <Section title="6. Pricing &amp; Availability">
          <p>Prices may change without prior notice. We make every effort to keep product listings accurate but do not guarantee the availability of any particular product at any given time.</p>
        </Section>

        <Section title="7. Prohibited Conduct">
          <ul className="list-disc pl-5 space-y-1">
            <li>Reselling purchased codes without written permission</li>
            <li>Providing false payment information or fraudulent screenshots</li>
            <li>Using automated tools to place orders</li>
            <li>Attempting to exploit pricing errors</li>
            <li>Harassing or threatening our support team</li>
          </ul>
          <p className="mt-2">Violation of these rules will result in immediate account suspension and may be reported to relevant authorities.</p>
        </Section>

        <Section title="8. Limitation of Liability">
          <p>Digital HUB shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability to you shall not exceed the amount you paid for the specific order in dispute.</p>
        </Section>

        <Section title="9. Intellectual Property">
          <p>All content on this website including the Digital HUB name, logo, and design is our intellectual property. You may not reproduce, distribute, or use our branding without prior written consent.</p>
        </Section>

        <Section title="10. Changes to Terms">
          <p>We may update these terms at any time. Continued use of our services after changes are posted constitutes acceptance of the revised terms. We recommend reviewing this page periodically.</p>
        </Section>

        <Section title="11. Governing Law">
          <p>These terms are governed by the laws of Nepal. Any disputes shall be resolved under the jurisdiction of the courts of Nepal.</p>
        </Section>

        <Section title="12. Contact Us">
          <p>For questions about these terms, contact us via WhatsApp at <a href="https://wa.me/9779826749317" className="text-primary hover:underline">+977 9826749317</a> or through the live chat on our website.</p>
        </Section>
      </motion.div>
    </div>
  );
}
