import { Link } from "wouter";
import { Listing } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Bed, Bath, LandPlot } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PropertyCardProps {
  listing: Listing;
  featured?: boolean;
}

const PropertyCard = ({ listing, featured = false }: PropertyCardProps) => {
  const {
    id,
    title,
    listingType,
    propertyType,
    price,
    rooms,
    area,
    city,
    district,
    photos,
    createdAt,
  } = listing;

  // Format date
  const formattedDate = new Date(createdAt).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition property-card">
      <div className="relative">
        <img
          src={photos[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600"}
          alt={title}
          className="w-full h-52 object-cover"
        />
        <div className="absolute top-4 left-4">
          <Badge className={listingType === "sale" ? "bg-secondary text-white" : "bg-primary text-white"}>
            {listingType === "sale" ? "Продаж" : "Оренда"}
          </Badge>
        </div>
        <button
          className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition"
          aria-label="Додати до обраного"
        >
          <Heart className="h-4 w-4 text-gray-700" />
        </button>
        <div className="property-card-overlay absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <Button variant="secondary" asChild>
            <Link href={`/property/${id}`}>
              Детальніше
            </Link>
          </Button>
        </div>
      </div>

      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg line-clamp-1">{title}</h3>
          <div className="text-secondary font-bold">
            {formatPrice(price)}
            {listingType === "rent" && "/міс"}
          </div>
        </div>

        <div className="text-gray-500 text-sm mb-3">
          {city}, {district}
        </div>

        <div className="flex gap-4 text-gray-700 mb-4">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-2 text-gray-400" />
            <span>{rooms} кімн.</span>
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-2 text-gray-400" />
            <span>1 санв.</span>
          </div>
          <div className="flex items-center">
            <LandPlot className="h-4 w-4 mr-2 text-gray-400" />
            <span>{area} м²</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            {!featured ? formattedDate : "Від власника"}
          </div>
          <Link
            href={`/property/${id}`}
            className="text-primary font-medium text-sm hover:underline"
          >
            Деталі
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
