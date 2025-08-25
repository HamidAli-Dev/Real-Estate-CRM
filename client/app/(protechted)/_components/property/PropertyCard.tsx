"use client";

import { useState } from "react";
import { MapPin, Bed, Bath, Square, User } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { propertyType } from "@/types/api.types";

interface PropertyCardProps {
  property: propertyType;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssignLead?: () => void;
  canManage?: boolean;
}

const PropertyCard = ({
  property,
  onEdit,
  onDelete,
  onAssignLead,
  canManage = false,
}: PropertyCardProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const mainImage = property.images[0]?.url || "/placeholder-property.jpg";
  const thumbnailImages = property.images.slice(1, 6);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Sold":
        return "bg-blue-100 text-blue-800";
      case "Under_Offer":
        return "bg-orange-100 text-orange-800";
      case "Rented":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPurposeColor = (purpose: string) => {
    return purpose === "forSale"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden pt-0">
        {/* Main Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => setIsImageModalOpen(true)}
          />

          {/* Status Badge */}
          <Badge
            className={`absolute top-3 left-3 ${getStatusColor(
              property.status
            )}`}
          >
            {property.status.replace("_", " ")}
          </Badge>

          {/* Purpose Badge */}
          <Badge
            className={`absolute top-3 right-3 ${getPurposeColor(
              property.purpose
            )}`}
          >
            {property.purpose === "forSale" ? "For Sale" : "For Rent"}
          </Badge>

          {/* Action Buttons */}
          {canManage && (
            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <Button size="sm" variant="secondary" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button size="sm" variant="destructive" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </div>
          )}

          {/* Property Price */}
          <div className="absolute bottom-3 right-3">
            <div className="bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
              {formatPrice(property.price)}
            </div>
          </div>
        </div>

        {/* Thumbnail Images */}
        {thumbnailImages.length > 0 && (
          <div className="px-4 pt-3 pb-2">
            <div className="flex space-x-2">
              {thumbnailImages.map((image, index) => (
                <div
                  key={image.id}
                  className="w-16 h-12 rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    setSelectedImageIndex(index + 1);
                    setIsImageModalOpen(true);
                  }}
                >
                  <img
                    src={image.url}
                    alt={`${property.title} ${index + 2}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Property Info */}
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer">
              {property.title}
            </h3>

            <div className="flex items-center text-sm text-gray-600">
              <span className="line-clamp-1">{property.propertyType}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="line-clamp-1">{property.location}</span>
            </div>

            <div className="text-2xl font-bold text-gray-900">
              {property.state}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center justify-between ">
              <div className="flex items-center space-x-4">
                {property.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4" />
                    <span>{property.bedrooms}</span>
                    <span>bed</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4" />
                    <span>{property.bathrooms}</span>
                    <span>bath</span>
                  </div>
                )}
              </div>
            </div>
            <div className=" ml-auto">
              {property.size && (
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  <span>{property.size.toLocaleString()} sq ft</span>
                </div>
              )}
            </div>
          </div>

          {/* Listed By */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex flex-col">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                <span>Listed by {property.listedBy.name}</span>
              </div>

              <div className="">
                <div className="text-xs text-gray-500">
                  {new Date(property.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Assign Lead Button */}
            {onAssignLead && (
              <Button size="sm" variant="outline" onClick={onAssignLead}>
                Assign Lead
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{property.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[4/3] overflow-hidden rounded-lg">
              <img
                src={property.images[selectedImageIndex]?.url || mainImage}
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Navigation */}
            {property.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {property.images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`w-20 h-16 rounded-md overflow-hidden cursor-pointer transition-all ${
                      index === selectedImageIndex
                        ? "ring-2 ring-blue-500"
                        : "hover:opacity-80"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image.url}
                      alt={`${property.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyCard;
