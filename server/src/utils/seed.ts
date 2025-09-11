import { db } from "./db";

const permissions = [
  // Property permissions
  { name: "VIEW_PROPERTIES", group: "Properties" },
  { name: "CREATE_PROPERTIES", group: "Properties" },
  { name: "EDIT_PROPERTIES", group: "Properties" },
  { name: "DELETE_PROPERTIES", group: "Properties" },

  // Lead permissions
  { name: "VIEW_LEADS", group: "Leads" },
  { name: "CREATE_LEADS", group: "Leads" },
  { name: "EDIT_LEADS", group: "Leads" },
  { name: "DELETE_LEADS", group: "Leads" },

  // Deal permissions
  { name: "VIEW_DEALS", group: "Deals" },
  { name: "CREATE_DEALS", group: "Deals" },
  { name: "EDIT_DEALS", group: "Deals" },
  { name: "DELETE_DEALS", group: "Deals" },

  // User management permissions
  { name: "VIEW_USERS", group: "Users" },
  { name: "INVITE_USERS", group: "Users" },
  { name: "EDIT_USER_ROLES", group: "Users" },
  { name: "REMOVE_USERS", group: "Users" },

  // Workspace settings
  { name: "VIEW_SETTINGS", group: "Workspace" },
  { name: "EDIT_SETTINGS", group: "Workspace" },

  // Analytics and reports
  { name: "VIEW_ANALYTICS", group: "Analytics" },
  { name: "EXPORT_REPORTS", group: "Analytics" },
];

async function main() {
  console.log("🌱 Seeding RBAC...");

  // 1. Create permissions if not exist
  for (const perm of permissions) {
    await db.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  console.log("✅ Permissions created/updated");

  // 2. Get all workspaces and create default roles for each
  const workspaces = await db.workspace.findMany();

  for (const workspace of workspaces) {
    console.log(`🏢 Creating roles for workspace: ${workspace.name}`);

    // Check if roles already exist for this workspace
    const existingRoles = await db.role.findMany({
      where: { workspaceId: workspace.id },
    });

    if (existingRoles.length > 0) {
      console.log(
        `⚠️  Roles already exist for workspace: ${workspace.name}, skipping...`
      );
      continue;
    }

    // Create Owner role (system role)
    const ownerRole = await db.role.create({
      data: {
        name: "Owner",
        workspaceId: workspace.id,
        isSystem: true,
      },
    });

    // Create Admin role
    const adminRole = await db.role.create({
      data: {
        name: "Admin",
        workspaceId: workspace.id,
        isSystem: false,
      },
    });

    // Create Manager role
    const managerRole = await db.role.create({
      data: {
        name: "Manager",
        workspaceId: workspace.id,
        isSystem: false,
      },
    });

    // Create Agent role
    const agentRole = await db.role.create({
      data: {
        name: "Agent",
        workspaceId: workspace.id,
        isSystem: false,
      },
    });

    // 3. Assign permissions to roles
    const allPermissions = await db.permission.findMany();

    // Owner gets all permissions
    for (const perm of allPermissions) {
      await db.rolePermission.create({
        data: {
          roleId: ownerRole.id,
          permissionId: perm.id,
        },
      });
    }

    // Admin gets most permissions (except some user management)
    const adminPermissions = allPermissions.filter(
      (p) => !["REMOVE_USERS"].includes(p.name)
    );
    for (const perm of adminPermissions) {
      await db.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      });
    }

    // Manager gets property and lead permissions
    const managerPermissions = allPermissions.filter((p) =>
      [
        "VIEW_PROPERTIES",
        "CREATE_PROPERTIES",
        "EDIT_PROPERTIES",
        "DELETE_PROPERTIES",
        "VIEW_LEADS",
        "CREATE_LEADS",
        "EDIT_LEADS",
        "DELETE_LEADS",
        "VIEW_DEALS",
        "CREATE_DEALS",
        "EDIT_DEALS",
        "DELETE_DEALS",
        "VIEW_USERS",
        "INVITE_USERS",
        "VIEW_ANALYTICS",
      ].includes(p.name)
    );
    for (const perm of managerPermissions) {
      await db.rolePermission.create({
        data: {
          roleId: managerRole.id,
          permissionId: perm.id,
        },
      });
    }

    // Agent gets basic permissions
    const agentPermissions = allPermissions.filter((p) =>
      [
        "VIEW_PROPERTIES",
        "CREATE_PROPERTIES",
        "EDIT_PROPERTIES",
        "VIEW_LEADS",
        "CREATE_LEADS",
        "EDIT_LEADS",
        "VIEW_DEALS",
        "CREATE_DEALS",
        "EDIT_DEALS",
      ].includes(p.name)
    );
    for (const perm of agentPermissions) {
      await db.rolePermission.create({
        data: {
          roleId: agentRole.id,
          permissionId: perm.id,
        },
      });
    }

    console.log(`✅ Roles created for workspace: ${workspace.name}`);
  }

  console.log("✅ RBAC Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding RBAC:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
