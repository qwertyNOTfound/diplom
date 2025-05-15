import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Listing, Photo } from "@shared/schema";
import { Heart } from "lucide-react";
import { useState } from "react";

interface PropertyCardProps {
  listing: {
    id: number;
    title: string;
    description: string;
    region: string;
    city: string;
    district: string;
    address: string;
    price: number;
    area: number;
    rooms: number;
    listingType: 'sale' | 'rent';
    propertyType: 'apartment' | 'house' | 'commercial' | 'land';
    photos: Photo[];
  };
  onFavoriteClick?: (id: number) => void;
  showFavoriteButton?: boolean;
}

export function PropertyCard({ 
  listing, 
  onFavoriteClick, 
  showFavoriteButton = true 
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    if (onFavoriteClick) {
      onFavoriteClick(listing.id);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uk-UA').format(price);
  };

  const propertyImage = listing.photos && listing.photos.length > 0
    ? listing.photos[0].url
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080';

  return (
    <Card className="overflow-hidden transition-transform hover:scale-[1.02] property-card">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={propertyImage} 
          alt={listing.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 left-0 bg-accent text-white py-1 px-3 rounded-br-lg text-sm font-medium">
          {listing.listingType === 'sale' ? 'Продаж' : 'Оренда'}
        </div>
        
        {showFavoriteButton && (
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </button>
        )}
        
        <div className="property-card-overlay">
          <Link href={`/property/${listing.id}`}>
            <Button variant="secondary">Детальніше</Button>
          </Link>
        </div>
      </div>
      
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold line-clamp-1">{listing.title}</h3>
          <div className="text-accent font-bold">
            {listing.listingType === 'sale' 
              ? `${formatPrice(listing.price)} грн` 
              : `${formatPrice(listing.price)} грн/міс`}
          </div>
        </div>
        
        <div className="text-gray-500 text-sm mb-3">
          {`${listing.city}, ${listing.district}`}
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
        
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <i className="fas fa-ruler-combined text-gray-400 mr-1"></i>
              <span className="text-gray-700">{`${listing.area} м²`}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-door-open text-gray-400 mr-1"></i>
              <span className="text-gray-700">{`${listing.rooms} кімн.`}</span>
            </div>
          </div>
          <Link href={`/property/${listing.id}`}>
            <span className="text-primary hover:text-primary-700 font-medium text-sm">
              Деталі
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
