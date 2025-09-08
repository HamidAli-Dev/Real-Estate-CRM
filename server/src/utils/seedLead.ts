import { Role } from "@prisma/client";
import { db } from "./db";

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create a workspace
  const workspace = await db.workspace.create({
    data: {
      name: "Dream Homes Agency",
      domain: "dreamhomes.com",
    },
  });

  // 2. Create a user (owner)
  const owner = await db.user.create({
    data: {
      name: "Hamid Ali",
      email: "hamid@example.com",
      password: "hashed_password", // ⚠️ hash it in real app
      workspaces: {
        create: {
          workspaceId: workspace.id,
          role: Role.Owner,
          status: "ACTIVE", // Owner should be active immediately
        },
      },
    },
  });

  // 3. Create default pipeline stages
  const stages = await db.pipelineStage.createMany({
    data: [
      { name: "New", order: 1, workspaceId: workspace.id },
      { name: "Contacted", order: 2, workspaceId: workspace.id },
      { name: "Negotiation", order: 3, workspaceId: workspace.id },
      { name: "Closed", order: 4, workspaceId: workspace.id },
    ],
  });
  console.log(`✅ Created ${stages.count} pipeline stages`);

  // 4. Create sample leads
  const stageNew = await db.pipelineStage.findFirst({
    where: { name: "New", workspaceId: workspace.id },
  });

  const lead1 = await db.lead.create({
    data: {
      name: "John Doe",
      contactInfo: "john.doe@example.com",
      workspaceId: workspace.id,
      assignedToId: owner.id,
      pipelineStageId: stageNew!.id,
    },
  });

  const lead2 = await db.lead.create({
    data: {
      name: "Jane Smith",
      contactInfo: "jane.smith@example.com",
      workspaceId: workspace.id,
      assignedToId: owner.id,
      pipelineStageId: stageNew!.id,
    },
  });

  // 5. Create sample property
  await db.property.create({
    data: {
      title: "Luxury Villa in Dubai",
      description: "5 bedroom villa with private pool",
      location: "Palm Jumeirah",
      city: "Dubai",
      price: 2500000,
      status: "Available",
      purpose: "forSale",
      propertyType: "Villa",
      workspace: {
        connect: { id: workspace.id },
      },
      category: {
        create: {
          category: "Villa",
          workspace: { connect: { id: workspace.id } },
        },
      },
      listedBy: {
        connect: { id: owner.id },
      },
    },
  });

  console.log("🌱 Seed finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
