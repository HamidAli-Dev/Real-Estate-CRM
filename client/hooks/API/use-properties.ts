import { useQuery } from "@tanstack/react-query";
import API from "@/lib/axios-client";

export interface Property {
  id: string;
  title: string;
  description?: string;
  location: string;
  city: string;
  address?: string;
  price: number;
  size?: number;
  bedrooms?: number;
  bathrooms?: number;
  status: string;
  purpose: string;
  propertyType: string;
  yearBuilt?: number;
  parkingSpaces?: number;
  features: string[];
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    order: number;
  }>;
  category: {
    id: string;
    category: string;
  };
  listedBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const useProperties = (
  workspaceId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["properties", workspaceId],
    queryFn: async (): Promise<Property[]> => {
      try {
        const response = await API.get(
          `/properties?workspaceId=${workspaceId}`
        );

        if (response.data && Array.isArray(response.data)) {
          return response.data;
        }

        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          return response.data.data;
        }

        console.warn(
          "⚠️ Unexpected properties response format:",
          response.data
        );
        return [];
      } catch (error) {
        console.error("❌ Error fetching properties:", error);
        return [];
      }
    },
    enabled: !!workspaceId && (options?.enabled ?? true),
    retry: 2,
    retryDelay: 1000,
  });
};
