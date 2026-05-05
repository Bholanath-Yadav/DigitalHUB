import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY not set. Chat will fall back to keyword matching.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const SYSTEM_PROMPT = `You are a helpful customer support assistant for Digital HUB Nepal, a gaming store that sells:
- Game top-ups: Free Fire Diamonds, PUBG UC, Mobile Legends Diamonds, TikTok Coins
- Subscriptions: Netflix, Spotify, YouTube Premium
- Gift Cards: Google Play, Steam, Apple
- Digital products and services

You provide friendly, professional support. Keep responses concise (1-2 sentences). 

Key information:
- Payment methods: eSewa, Khalti, IME Pay
- Delivery: Digital products delivered 1-2 hours after payment verification
- Refunds: Contact WhatsApp +977 9826749317, processed in 3-5 business days
- Support: WhatsApp +977 9826749317 for urgent issues
- Store: https://digitalhub.com.np

Always be helpful and guide users to browse products or contact support for complex issues.`;

export async function getAIResponse(userMessage: string): Promise<string> {
  if (!genAI) {
    // Fallback to keyword-based response
    return getFallbackResponse(userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();
    return response.trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    return getFallbackResponse(userMessage);
  }
}

function getFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  const responses: Record<string, string> = {
    "hello|hi|hey": "👋 Hello! Welcome to Digital HUB Nepal. How can I help you today?",
    "help|support": "I can help with orders, payments, products, game top-ups, and subscriptions. What do you need?",
    "order|status": "To check your order status, visit 'My Orders' in your profile. For help, WhatsApp +977 9826749317.",
    "payment|pay": "We accept eSewa, Khalti, and IME Pay. After payment, upload your screenshot for verification.",
    "refund": "Contact our support team via WhatsApp +977 9826749317. Refunds are processed in 3-5 business days.",
    "delivery|delivered": "Digital products are delivered 1-2 hours after payment verification.",
    "free fire|ff": "We offer Free Fire Diamonds in multiple amounts. Browse our Game Top-ups section!",
    "pubg|uc": "PUBG UC available! Check out our Game Top-ups for the latest packages.",
    "price|cost|discount": "We have competitive prices with no hidden fees. Browse our products to compare.",
    "esewa": "Yes, we accept eSewa! You'll see our details after placing your order.",
    "khalti": "Yes, we accept Khalti! Payment details appear after you place your order.",
    "netflix|spotify|subscription": "Subscriptions available in our Subscriptions section. Instant delivery after payment!",
  };

  for (const [keywords, reply] of Object.entries(responses)) {
    if (keywords.split("|").some(kw => lower.includes(kw))) {
      return reply;
    }
  }

  return "Thanks for your message! Our support team will reply shortly. For urgent help, WhatsApp +977 9826749317. 🎮";
}
