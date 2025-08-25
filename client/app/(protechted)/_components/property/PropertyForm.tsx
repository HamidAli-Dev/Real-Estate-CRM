"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  X,
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { useWorkspaceContext } from "@/context/workspace-provider";
import { useAuthContext } from "@/context/auth-provider";
import {
  createPropertyType,
  editPropertyType,
  propertyType,
} from "@/types/api.types";

const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  location: z.string().optional(), // Make optional since it's computed
  city: z.string().min(2, "City is required"),
  address: z.string().min(3, "Address is required"),
  price: z.number().min(0, "Price must be positive"),
  size: z.number().min(0, "Size must be positive").optional(),
  bedrooms: z.number().min(0, "Bedrooms must be positive").optional(),
  bathrooms: z.number().min(0, "Bathrooms must be positive").optional(),
  status: z.enum(["Available", "Pending", "Sold", "Under_Offer", "Rented"]),
  purpose: z.enum(["forSale", "forRent"]),
  propertyType: z.enum([
    "House",
    "Apartment",
    "Land",
    "Commercial",
    "Villa",
    "Townhouse",
    "Office",
    "Shop",
    "Warehouse",
  ]),
  categoryId: z.string().min(1, "Category is required"),
  images: z
    .array(z.instanceof(File))
    .min(1, "At least one image is required")
    .max(6, "Maximum 6 images allowed"),
  // New fields for the wizard
  yearBuilt: z
    .number()
    .min(1800, "Year must be after 1800")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .optional(),
  parkingSpaces: z
    .number()
    .min(0, "Parking spaces must be 0 or more")
    .optional(),
  features: z.array(z.string()).optional(),
  zipCode: z.string().optional(),
  state: z.string().min(2, "State is required"),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  mode: "create" | "edit";
  initialData?: propertyType;
  onSubmit: (
    data: createPropertyType | editPropertyType,
    mode: "create" | "edit"
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
  categories: Array<{ id: string; category: string }>;
}

const FEATURES_LIST = [
  "Floor-to-ceiling windows",
  "Hardwood floors",
  "Stainless steel appliances",
  "Granite countertops",
  "Walk-in closets",
  "Central air conditioning",
  "Balcony/Patio",
  "Fireplace",
  "In-unit laundry",
  "Dishwasher",
  "Parking included",
  "Pet-friendly",
  "Swimming pool access",
  "Gym/Fitness center",
  "24/7 concierge",
  "Rooftop terrace",
  "Storage unit",
  "High-speed internet ready",
];

const PropertyForm = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  categories,
}: PropertyFormProps) => {
  const { currentWorkspace } = useWorkspaceContext();
  const { user } = useAuthContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<
    Array<{ id: string; url: string; alt?: string }>
  >([]);
  const [deletedExistingImages, setDeletedExistingImages] = useState<string[]>(
    []
  );
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customFeature, setCustomFeature] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentsInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    mode: "onChange",
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location:
        initialData?.location ||
        `${initialData?.city || ""}, ${initialData?.state || ""}`,
      city: initialData?.city || "",
      address: initialData?.address || "",
      price: initialData?.price ?? 0,
      size: initialData?.size ?? 0,
      bedrooms: initialData?.bedrooms ?? 0,
      bathrooms: initialData?.bathrooms ?? 0,
      status: initialData?.status || "Available",
      purpose: initialData?.purpose || "forSale",
      propertyType: initialData?.propertyType || "House",
      categoryId: initialData?.categoryId || "",
      images: [],
      yearBuilt: initialData?.yearBuilt ?? 1800,
      parkingSpaces: initialData?.parkingSpaces ?? 0,
      features: initialData?.features ?? [],
      zipCode: initialData?.zipCode || "",
      state: initialData?.state || "",
    },
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData && mode === "edit") {
      form.reset({
        title: initialData.title || "",
        description: initialData.description || "",
        location:
          initialData.location ||
          `${initialData.city || ""}, ${initialData.state || ""}`,
        city: initialData.city || "",
        address: initialData.address || "",
        price: initialData.price ?? 0,
        size: initialData.size ?? 0,
        bedrooms: initialData.bedrooms ?? 0,
        bathrooms: initialData.bathrooms ?? 0,
        status: initialData.status || "Available",
        purpose: initialData?.purpose || "forSale",
        propertyType: initialData.propertyType || "House",
        categoryId: initialData.categoryId || "",
        images: [],
        yearBuilt: initialData.yearBuilt ?? 1800,
        parkingSpaces: initialData.parkingSpaces ?? 0,
        features: initialData.features ?? [],
        zipCode: initialData.zipCode || "",
        state: initialData.state || "",
      });

      // Set existing images for edit mode
      const existingImgs = initialData.images || [];
      setExistingImages(existingImgs);

      // Clear deleted images state
      setDeletedExistingImages([]);

      // Set selected features
      setSelectedFeatures(initialData.features || []);
    }
  }, [initialData, mode, form]);

  // Reset form when switching between create/edit modes
  useEffect(() => {
    if (mode === "create") {
      form.reset({
        title: "",
        description: "",
        location: "",
        city: "",
        address: "",
        price: 0,
        size: 0,
        bedrooms: 0,
        bathrooms: 0,
        status: "Available",
        purpose: "forSale",
        propertyType: "House",
        categoryId: "",
        images: [],
        yearBuilt: 1800,
        parkingSpaces: 0,
        features: [],
        zipCode: "",
        state: "",
      });
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setExistingImages([]);
      setDeletedExistingImages([]);
      setSelectedDocuments([]);
      setSelectedFeatures([]);
    }
  }, [mode, form]);

  // Update location when city or state changes
  useEffect(() => {
    const city = form.watch("city");
    const state = form.watch("state");
    if (city && state) {
      form.setValue("location", `${city}, ${state}`);
    }
  }, [form.watch("city"), form.watch("state"), form]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (selectedImages.length + files.length > 6) {
      alert("Maximum 6 images allowed");
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);
    form.setValue("images", newImages);

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
  };

  const handleDocumentSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedDocuments([...selectedDocuments, ...files]);
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
    form.setValue("images", newImages);
  };

  const removeExistingImage = (imageId: string) => {
    setDeletedExistingImages([...deletedExistingImages, imageId]);
    setExistingImages(existingImages.filter((img) => img.id !== imageId));
  };

  const removeDocument = (index: number) => {
    setSelectedDocuments(selectedDocuments.filter((_, i) => i !== index));
  };

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter((f) => f !== feature)
      : [...selectedFeatures, feature];
    setSelectedFeatures(newFeatures);
    form.setValue("features", newFeatures);
  };

  const addCustomFeature = () => {
    if (
      customFeature.trim() &&
      !selectedFeatures.includes(customFeature.trim())
    ) {
      const newFeatures = [...selectedFeatures, customFeature.trim()];
      setSelectedFeatures(newFeatures);
      form.setValue("features", newFeatures);
      setCustomFeature("");
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const values = form.getValues();

    switch (step) {
      case 1:
        // Validate basic information fields
        const step1Fields = [
          "title",
          "categoryId",
          "purpose",
          "propertyType",
          "price",
          "address",
          "city",
          "state",
        ];
        for (const field of step1Fields) {
          const result = await form.trigger(field as keyof PropertyFormData);
          if (!result) {
            return false;
          }
        }
        return true;

      case 2:
        // Validate property details fields - these are optional, so just check if they're valid when filled
        const step2Fields = ["bedrooms", "bathrooms", "size"];
        for (const field of step2Fields) {
          const value = values[field as keyof PropertyFormData];
          // Only validate if the field has a value (since they're optional)
          if (value !== undefined && value !== null && value !== "") {
            const result = await form.trigger(field as keyof PropertyFormData);
            if (!result) {
              return false;
            }
          }
        }
        return true;

      case 3:
        if (mode === "edit") {
          // In edit mode, don't validate the images field, just check if we have images
          const editResult =
            selectedImages.length > 0 || existingImages.length > 0;
          return editResult;
        }
        // In create mode, require at least one new image and validate the field
        const result = await form.trigger("images");
        const createResult = result && selectedImages.length > 0;
        return createResult;

      default:
        return true;
    }
  };

  const nextStep = async () => {
    if (currentStep < 3) {
      const isValid = await validateStep(currentStep);
      if (isValid) {
        setCurrentStep(currentStep + 1);
      } else {
        console.log("🔍 Step validation failed, staying on step:", currentStep);
      }
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: PropertyFormData) => {
    // Validate step 3 before submitting
    const step3Valid = await validateStep(3);

    if (mode === "create") {
      const createData: createPropertyType = {
        ...data,
        location: `${data.city}, ${data.state}`, // Derive location from city and state
        workspaceId: currentWorkspace!.workspace.id,
        listedById: user!.id,
        features: selectedFeatures,
        // Ensure numeric fields are properly handled
        yearBuilt: data.yearBuilt || undefined,
        parkingSpaces: data.parkingSpaces || undefined,
      };
      onSubmit(createData, mode);
    } else {
      const editData = {
        ...data,
        features: selectedFeatures,
        // Ensure numeric fields are properly handled
        yearBuilt: data.yearBuilt || undefined,
        parkingSpaces: data.parkingSpaces || undefined,
        // Include information about deleted images
        deletedImageIds: deletedExistingImages,
      } as editPropertyType & { deletedImageIds: string[] };

      onSubmit(editData, mode);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-8">
        {/* Step 1 */}
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {currentStep > 1 ? <Check className="w-5 h-5" /> : "1"}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              Basic Information
            </div>
            <div className="text-xs text-gray-500">
              Property title, description, and pricing
            </div>
          </div>
        </div>

        {/* Connector */}
        <div
          className={`w-16 h-0.5 ${
            currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"
          }`}
        />

        {/* Step 2 */}
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {currentStep > 2 ? <Check className="w-5 h-5" /> : "2"}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              Property Details
            </div>
            <div className="text-xs text-gray-500">
              Specifications, features, and amenities
            </div>
          </div>
        </div>

        {/* Connector */}
        <div
          className={`w-16 h-0.5 ${
            currentStep >= 3 ? "bg-blue-600" : "bg-gray-200"
          }`}
        />

        {/* Step 3 */}
        <div className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            3
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              Photos & Media
            </div>
            <div className="text-xs text-gray-500">
              Upload property images and documents
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Property Specifications
      </h2>

      {/* Property Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          control={form.control}
          name="bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Bedrooms *
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Bathrooms *
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Square Footage *
              </FormLabel>
              <FormControl>
                <div className="relative mt-1">
                  <Input
                    type="number"
                    placeholder="1200"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || undefined)
                    }
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    sq ft
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="yearBuilt"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Year Built
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2020"
                  className="mt-1"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parkingSpaces"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Parking Spaces
              </FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Features & Amenities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Features & Amenities
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES_LIST.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={feature}
                checked={selectedFeatures.includes(feature)}
                onCheckedChange={() => handleFeatureToggle(feature)}
              />
              <Label
                htmlFor={feature}
                className="text-sm text-gray-700 cursor-pointer"
              >
                {feature}
              </Label>
            </div>
          ))}
        </div>

        {/* Add Custom Feature */}
        <div className="flex items-center space-x-2 mt-4">
          <Input
            placeholder="Add custom feature..."
            value={customFeature}
            onChange={(e) => setCustomFeature(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === "Enter" && addCustomFeature()}
          />
          <Button
            type="button"
            onClick={addCustomFeature}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Selected Custom Features */}
        {selectedFeatures.filter((f) => !FEATURES_LIST.includes(f)).length >
          0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedFeatures
              .filter((f) => !FEATURES_LIST.includes(f))
              .map((feature) => (
                <Badge
                  key={feature}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleFeatureToggle(feature)}
                >
                  {feature} <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Property Photos</h2>

      <p className="text-gray-600 mb-6">
        Upload high-quality photos of your property. The first image will be
        used as the main listing photo.
      </p>

      {/* Image Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-gray-400 transition-colors">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upload Property Photos
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop your images here, or click to browse
            </p>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 mb-2"
            >
              Choose Images
            </Button>
            <p className="text-xs text-gray-500">
              Supported formats: JPG, PNG, WebP (Max 10MB each)
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {/* Images Preview */}
      {(imagePreviewUrls.length > 0 || existingImages.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Property Images
          </h3>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Existing Images
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.alt || `Property image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <Badge className="absolute top-2 left-2 bg-gray-600">
                      Existing
                    </Badge>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeExistingImage(image.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {imagePreviewUrls.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">New Images</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`New property image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                    <Badge className="absolute top-2 left-2 bg-blue-600">
                      New
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Photo Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">
              Photo Tips for Better Results
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • Use natural lighting when possible for the best image quality
              </li>
              <li>• Include photos of all rooms, exterior, and key features</li>
              <li>• Take photos from different angles to showcase the space</li>
              <li>• Ensure images are sharp and well-composed</li>
              <li>
                • The first image will be the main listing photo - choose your
                best shot
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Additional Documents */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Additional Documents (Optional)
        </h3>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Upload Supporting Documents
              </h4>
              <p className="text-gray-600 mb-4">
                Floor plans, property surveys, inspection reports, etc.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => documentsInputRef.current?.click()}
              >
                Choose Files
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Supported: PDF, DOC, XLS, PNG, JPG (Max 25MB each)
              </p>
            </div>
          </div>

          <input
            ref={documentsInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            onChange={handleDocumentSelect}
            className="hidden"
          />
        </div>

        {/* Selected Documents */}
        {selectedDocuments.length > 0 && (
          <div className="space-y-2">
            {selectedDocuments.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">{doc.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Basic Information
      </h2>

      {/* Property Title */}
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Property Title *
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. Modern Downtown Loft with City Views"
                className="mt-1"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Category and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Category *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories &&
                  Array.isArray(categories) &&
                  categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.category}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>
                      Loading categories...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Status
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Available" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                  <SelectItem value="Under_Offer">Under Offer</SelectItem>
                  <SelectItem value="Rented">Rented</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Purpose and Property Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="purpose"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Purpose *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Purpose" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="forSale">For Sale</SelectItem>
                  <SelectItem value="forRent">For Rent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="propertyType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Property Type *
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Townhouse">Townhouse</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Shop">Shop</SelectItem>
                  <SelectItem value="Warehouse">Warehouse</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Price */}
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Price *
            </FormLabel>
            <FormControl>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="850000"
                  className="pl-8"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Property Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium text-gray-700">
              Property Description
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the property features, amenities, location benefits, and any unique selling points..."
                className="min-h-[120px] mt-1"
                {...field}
              />
            </FormControl>
            <div className="text-right text-xs text-gray-500 mt-1">
              {field.value?.length || 0}/500 characters
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Location Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Location Details
        </h3>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                Street Address *
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="123 Main Street"
                  className="mt-1"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  City *
                </FormLabel>
                <FormControl>
                  <Input placeholder="New York" className="mt-1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">
                  State *
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="CA">California</SelectItem>
                    <SelectItem value="TX">Texas</SelectItem>
                    <SelectItem value="FL">Florida</SelectItem>
                    {/* Add more states as needed */}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">
                ZIP Code
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="10001"
                  className="mt-1 max-w-xs"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="border-b">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {mode === "create" ? "Add New Property" : "Edit Property"}
            </CardTitle>
            <p className="text-gray-600 mt-1">
              {mode === "create"
                ? "Create a new property listing for your inventory"
                : "Update your property listing information"}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              // Only allow form submission on step 3
              if (currentStep !== 3) {
                return;
              }

              handleSubmit(form.getValues());
            }}
            className="space-y-8"
          >
            {/* Step Indicator */}
            {renderStepIndicator()}

            {/* Step Content */}
            <div className="min-h-[600px]">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-8 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={previousStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    /* Save as draft functionality */
                  }}
                >
                  Save as Draft
                </Button>

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      nextStep();
                    }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      (mode === "create"
                        ? selectedImages.length === 0
                        : existingImages.length === 0) ||
                      false // Temporarily disable form validation to test
                    }
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>
                          {mode === "create"
                            ? "Creating Property..."
                            : "Updating Property..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>
                          {mode === "create"
                            ? "Create Property"
                            : "Update Property"}
                        </span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  // Validate form when step changes to ensure proper validation
  useEffect(() => {
    if (currentStep === 3) {
      const validateForm = async () => {
        const isValid = await form.trigger();
      };
      validateForm();
    }
  }, [currentStep, form, mode, existingImages.length, selectedImages.length]);
};

export default PropertyForm;
