import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { db } from "../utils/db";
import {
  triggerPropertyListedNotification,
  triggerPropertyStatusChangedNotification,
} from "./notification-triggers.service";

// Helper function to get or create default property categories
const getOrCreateDefaultCategories = async (workspaceId: string) => {
  const categories = await db.propertyCategory.findMany({
    where: { workspaceId },
  });

  if (categories.length === 0) {
    // Create default categories
    const defaultCategories = [
      { category: "House" as const },
      { category: "Apartment" as const },
      { category: "Land" as const },
      { category: "Commercial" as const },
      { category: "Villa" as const },
      { category: "Townhouse" as const },
    ];

    const createdCategories = await db.propertyCategory.createMany({
      data: defaultCategories.map((cat) => ({
        ...cat,
        workspaceId,
      })),
    });

    return await db.propertyCategory.findMany({
      where: { workspaceId },
    });
  }

  return categories;
};

export const createPropertyService = asyncHandler(async (req, res) => {
  const data = req.body;
  const images = req.files as Express.Multer.File[];

  // Validate category exists
  const category = await db.propertyCategory.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new AppError("Property category not found", 404);
  }

  try {
    // Create property with images in a transaction
    const result = await db.$transaction(
      async (tx) => {
        // Create the property first
        const property = await tx.property.create({
          data: {
            title: data.title,
            description: data.description,
            location: data.location,
            city: data.city,
            address: data.address,
            price: parseFloat(data.price.toString()),
            size: data.size ? parseFloat(data.size.toString()) : null,
            bedrooms: data.bedrooms ? parseInt(data.bedrooms.toString()) : null,
            bathrooms: data.bathrooms
              ? parseInt(data.bathrooms.toString())
              : null,
            status: data.status,
            purpose: data.purpose,
            propertyType: data.propertyType,
            categoryId: data.categoryId,
            workspaceId: data.workspaceId,
            listedById: data.listedById,
            // New wizard fields
            yearBuilt: data.yearBuilt
              ? parseInt(data.yearBuilt.toString())
              : null,
            parkingSpaces: data.parkingSpaces
              ? parseInt(data.parkingSpaces.toString())
              : null,
            features: data.features ? JSON.parse(data.features) : [],
            zipCode: data.zipCode,
            state: data.state,
          } as any,
        });

        // Create property images if provided
        if (images && images.length > 0) {
          const imageData = images.map((image, index) => {
            const imageUrl = (image as any).path || image.filename;

            return {
              url: imageUrl, // Cloudinary URL
              alt: `${data.title} image ${index + 1}`,
              order: index,
              propertyId: property.id,
            };
          });

          await tx.propertyImage.createMany({
            data: imageData,
          });
        }

        return property;
      },
      {
        timeout: 30000, // 30 second timeout for the transaction
      }
    );

    // Fetch the complete property with all relations
    const propertyWithImages = await db.property.findUnique({
      where: { id: result.id },
      include: {
        listedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Trigger notification for new property listing
    try {
      await triggerPropertyListedNotification(
        result.id,
        propertyWithImages?.listedBy.name || "System",
        data.workspaceId
      );
    } catch (error) {
      console.error(
        "❌ Failed to trigger property listed notification:",
        error
      );
      // Don't throw error - notification failure shouldn't break property creation
    }

    res.status(201).json({
      success: true,
      data: propertyWithImages,
      message: "Property created successfully",
    });
  } catch (error) {
    console.error("❌ Property creation failed:", error);
    throw new AppError(
      error instanceof Error ? error.message : "Failed to create property",
      500
    );
  }
});

export const getPropertiesService = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  if (!workspaceId || typeof workspaceId !== "string") {
    throw new AppError("Workspace ID is required", 400);
  }

  const properties = await db.property.findMany({
    where: { workspaceId },
    include: {
      listedBy: true,
      workspace: true,
      category: true,
      images: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json({
    success: true,
    data: properties,
  });
});

export const getPropertyByIdService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const property = await db.property.findUnique({
    where: { id },
    include: {
      listedBy: true,
      workspace: true,
      category: true,
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  res.status(200).json({
    success: true,
    data: property,
  });
});

export const updatePropertyService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const images = req.files as Express.Multer.File[];

  // Check if property exists and user has permission
  const existingProperty = await db.property.findUnique({
    where: { id },
    include: { listedBy: true },
  });

  if (!existingProperty) {
    throw new AppError("Property not found", 404);
  }

  // Check if user is the owner or has admin rights
  if (existingProperty.listedById !== req.user.id) {
    // Check if user has permission to edit properties in the workspace
    const userWorkspace = await db.userWorkspace.findFirst({
      where: {
        userId: req.user.id,
        workspaceId: existingProperty.workspaceId,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!userWorkspace) {
      throw new AppError(
        "You don't have permission to edit this property",
        403
      );
    }

    // Check if user has EDIT_PROPERTIES permission or is Owner
    const hasPermission =
      (userWorkspace.role.isSystem && userWorkspace.role.name === "Owner") ||
      userWorkspace.role.rolePermissions.some(
        (rp) => rp.permission.name === "EDIT_PROPERTIES"
      );

    if (!hasPermission) {
      throw new AppError(
        "You don't have permission to edit this property",
        403
      );
    }
  }

  // Validate category if provided
  if (data.categoryId) {
    const category = await db.propertyCategory.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new AppError("Property category not found", 404);
    }
  }

  try {
    // Update property with images in a transaction
    const result = await db.$transaction(
      async (tx) => {
        // Update the property
        const property = await tx.property.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
            location: data.location,
            city: data.city,
            address: data.address,
            price: data.price ? parseFloat(data.price.toString()) : undefined,
            size: data.size ? parseFloat(data.size.toString()) : undefined,
            bedrooms: data.bedrooms
              ? parseInt(data.bedrooms.toString())
              : undefined,
            bathrooms: data.bathrooms
              ? parseInt(data.bathrooms.toString())
              : undefined,
            status: data.status,
            purpose: data.purpose,
            propertyType: data.propertyType,
            categoryId: data.categoryId,
            // New wizard fields
            yearBuilt: data.yearBuilt
              ? parseInt(data.yearBuilt.toString())
              : undefined,
            parkingSpaces: data.parkingSpaces
              ? parseInt(data.parkingSpaces.toString())
              : undefined,
            features: data.features ? JSON.parse(data.features) : undefined,
            zipCode: data.zipCode,
            state: data.state,
          } as any,
        });

        // Handle image updates if new images are provided
        if (images && images.length > 0) {
          // Delete existing images
          await tx.propertyImage.deleteMany({
            where: { propertyId: id },
          });

          // Create new property images from Cloudinary uploads
          const imageData = images.map((image, index) => ({
            url: (image as any).path || image.filename, // Cloudinary URL
            alt: `${data.title || existingProperty.title} image ${index + 1}`,
            order: index,
            propertyId: id,
          }));

          await tx.propertyImage.createMany({
            data: imageData,
          });
        }

        return property;
      },
      {
        timeout: 30000, // 30 second timeout for the transaction
      }
    );

    // Fetch the complete updated property with images
    const propertyWithImages = await db.property.findUnique({
      where: { id },
      include: {
        listedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    // Trigger notification for property status change if status was updated
    try {
      if (data.status && data.status !== existingProperty.status) {
        await triggerPropertyStatusChangedNotification(
          id,
          data.status,
          req.user.email || "System",
          existingProperty.workspaceId
        );
      }
    } catch (error) {
      console.error(
        "❌ Failed to trigger property status changed notification:",
        error
      );
      // Don't throw error - notification failure shouldn't break property update
    }

    res.status(200).json({
      success: true,
      data: propertyWithImages,
      message: "Property updated successfully",
    });
  } catch (error) {
    console.error("❌ Property update failed:", error);
    throw new AppError(
      error instanceof Error ? error.message : "Failed to update property",
      500
    );
  }
});

export const deletePropertyService = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if property exists and user has permission
  const property = await db.property.findUnique({
    where: { id },
    include: { listedBy: true },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  // Check if user is the owner or has admin rights
  if (property.listedById !== req.user.id) {
    const userWorkspace = await db.userWorkspace.findFirst({
      where: {
        userId: req.user.id,
        workspaceId: property.workspaceId,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!userWorkspace) {
      throw new AppError(
        "You don't have permission to delete this property",
        403
      );
    }

    // Check if user has DELETE_PROPERTIES permission or is Owner
    const hasPermission =
      (userWorkspace.role.isSystem && userWorkspace.role.name === "Owner") ||
      userWorkspace.role.rolePermissions.some(
        (rp) => rp.permission.name === "DELETE_PROPERTIES"
      );

    if (!hasPermission) {
      throw new AppError(
        "You don't have permission to delete this property",
        403
      );
    }
  }

  // Delete property (images will be deleted automatically due to cascade)
  await db.property.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: "Property deleted successfully",
  });
});

export const getPropertyCategoriesService = asyncHandler(async (req, res) => {
  const { workspaceId } = req.query;

  if (!workspaceId || typeof workspaceId !== "string") {
    throw new AppError("Workspace ID is required", 400);
  }

  const categories = await getOrCreateDefaultCategories(workspaceId);

  res.status(200).json({
    success: true,
    data: categories,
  });
});
