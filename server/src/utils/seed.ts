// prisma/seed.ts
import { APP_CONFIG } from "../config/app.config";
import { db } from "../utils/db";

async function main() {
  console.log("🌱 Starting seed...");

  const plans = [
    {
      name: "Basic",
      price: 9.99,
      duration: "monthly",
      features: [
        "Lead Management",
        "Task Automation",
        "Client Relationship Management",
      ],
      stripePriceId: APP_CONFIG.STRIPE_BASIC_PLAN_STRIPE_PRICE_ID,
    },
    {
      name: "Standard",
      price: 19.99,
      duration: "monthly",
      features: [
        "Lead Management",
        "Task Automation",
        "Client Relationship Management",
        "Advanced Reporting",
        "Team Collaboration",
      ],
      stripePriceId: APP_CONFIG.STRIPE_STANDARD_PLAN_STRIPE_PRICE_ID,
    },
    {
      name: "Pro",
      price: 49.99,
      duration: "monthly",
      features: [
        "Lead Management",
        "Task Automation",
        "Client Relationship Management",
        "Advanced Reporting",
        "Team Collaboration",
        "Custom Integrations",
      ],
      stripePriceId: APP_CONFIG.STRIPE_PRO_PLAN_STRIPE_PRICE_ID,
    },
  ];

  // Clear old data
  await db.plan.deleteMany();

  // Insert plans
  for (const plan of plans) {
    await db.plan.create({
      data: {
        name: plan.name,
        price: plan.price,
        duration: plan.duration as any, // enum type
        features: plan.features,
        stripePriceId: plan.stripePriceId,
      },
    });
  }

  console.log("✅ Plans seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
