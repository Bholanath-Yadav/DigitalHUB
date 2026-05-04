import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-lg font-bold mb-3 text-foreground">{title}</h2>
    <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">{children}</div>
  </div>
);

export default function RefundPolicyPage() {
  useSEO({
    title: "Refund Policy",
    description: "Read the Refund Policy for Digital HUB Nepal. Understand eligibility, the refund process, and timelines for game top-ups, gift cards and subscriptions.",
    keywords: "digital hub refund policy nepal, gaming store refund nepal, digital hub nepal refund",
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
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black">Refund Policy</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Last updated: May 2026</p>
            </div>
          </motion.div>
          <p className="text-sm text-muted-foreground">
            We want you to be fully satisfied with every purchase. Please read our refund policy to understand when refunds apply.
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
        <Section title="Our Refund Philosophy">
          <p>Because we sell digital products (top-up codes, vouchers, subscription keys), all sales are generally final once a code or top-up has been delivered. However, we take customer satisfaction seriously and will always investigate genuine issues.</p>
        </Section>

        <Section title="When You Are Eligible for a Refund">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Product not delivered</strong> — If your order was marked paid but no code/top-up was received within 24 hours, you are entitled to a full refund or re-delivery.</li>
            <li><strong className="text-foreground">Wrong product delivered</strong> — If you received a different product or denomination than what you ordered, we will correct it or issue a full refund.</li>
            <li><strong className="text-foreground">Non-working code</strong> — If a redeemable code is invalid at the time of delivery and we cannot replace it, a full refund will be issued.</li>
            <li><strong className="text-foreground">Duplicate charge</strong> — If you were charged twice for the same order, the extra payment will be refunded immediately.</li>
          </ul>
        </Section>

        <Section title="When Refunds Are Not Applicable">
          <ul className="list-disc pl-5 space-y-1">
            <li>The code has already been redeemed or used.</li>
            <li>You entered your game ID / account details incorrectly and the top-up was credited to the wrong account.</li>
            <li>You changed your mind after a digital code was revealed.</li>
            <li>Refund is requested more than 7 days after delivery.</li>
            <li>The issue is caused by the game platform or publisher (e.g., temporary server errors on the game's end).</li>
          </ul>
        </Section>

        <Section title="How to Request a Refund">
          <p>Contact us as soon as possible through one of the following channels:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>WhatsApp: <a href="https://wa.me/9779826749317" className="text-primary hover:underline">+977 9826749317</a></li>
            <li>Live Chat on our website</li>
          </ul>
          <p className="mt-2">Please include your <strong className="text-foreground">Order ID</strong>, a description of the issue, and any supporting screenshots. We aim to respond within 24 hours.</p>
        </Section>

        <Section title="Refund Processing Time">
          <p>Once a refund is approved, the amount will be returned to your original payment method (eSewa, Khalti, or IME Pay) within <strong className="text-foreground">3–5 business days</strong>. Processing times depend on the payment provider.</p>
        </Section>

        <Section title="Order Cancellations">
          <p>You may cancel an order before payment is verified by contacting our support team immediately. Once payment is confirmed and the product has been delivered, the order cannot be cancelled.</p>
        </Section>

        <Section title="Contact">
          <p>For refund requests or disputes, reach us at <a href="https://wa.me/9779826749317" className="text-primary hover:underline">+977 9826749317</a> via WhatsApp or use the live chat widget on our site.</p>
        </Section>
      </motion.div>
    </div>
  );
}
