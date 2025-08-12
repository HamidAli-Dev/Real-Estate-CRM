const subscriptionPlans = {
  basic: {
    name: "Basic",
    price: "29.99",
    duration: "monthly",
    features: [
      "Up to 3 Users",
      "Lead Management",
      "Property Listings (Up to 50)",
      "Basic Reporting",
      "Email Support",
    ],
    stripePriceId: process.env.STRIPE_BASIC_PLAN_STRIPE_PRICE_ID as string,
  },
  standard: {
    name: "Standard",
    price: "59.99",
    duration: "monthly",
    features: [
      "Up to 10 Users",
      "Lead Management",
      "Property Listings (Up to 200)",
      "Task Automation",
      "Client Relationship Management",
      "Advanced Reporting",
      "Priority Email Support",
    ],
    stripePriceId: process.env.STRIPE_STANDARD_PLAN_STRIPE_PRICE_ID,
  },
  pro: {
    name: "Pro",
    price: "129.99",
    duration: "monthly",
    features: [
      "Unlimited Users",
      "Unlimited Property Listings",
      "Lead Management",
      "Task Automation",
      "Client Relationship Management",
      "Advanced Reporting",
      "Team Collaboration Tools",
      "Custom Integrations",
      "Dedicated Account Manager",
    ],
    stripePriceId: process.env.STRIPE_PRO_PLAN_STRIPE_PRICE_ID,
  },
} as const;

export type SubscriptionPlanType = keyof typeof subscriptionPlans;

export const subscriptionPlansList = [
  subscriptionPlans.basic,
  subscriptionPlans.standard,
  subscriptionPlans.pro,
];

export function getSubscriptionPlanById(priceId: string) {
  return Object.values(subscriptionPlans).find(
    (plan) => plan.stripePriceId === priceId
  );
}
