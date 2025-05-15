import { useLocation } from "wouter";
import { FaBed, FaBath, FaRulerCombined, FaHeart } from "react-icons/fa";
import { Button } from "@/components/ui/button";

interface PropertyCardProps {
  property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [, navigate] = useLocation();
  
  // Format price with separator
  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };
  
  // Handle card click
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if the click was on the favorite button
    if ((e.target as HTMLElement).closest(".favorite-button")) {
      return;
    }
    
    navigate(`/properties/${property.id}`);
  };
  
  // Toggle favorite (placeholder)
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This would be implemented with actual functionality in a real app
    console.log("Toggle favorite for property", property.id);
  };
  
  return (
    <div 
      className="property-card cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="property-card-image">
        <img 
          src={property.images?.[0]?.imageUrl || "https://via.placeholder.com/500x330?text=No+Image"} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        <div className={`property-card-badge ${
          property.listingType === "sale" ? "property-card-badge-sale" : "property-card-badge-rent"
        }`}>
          {property.listingType === "sale" ? "Продаж" : "Оренда"}
        </div>
        <button 
          className="favorite-button absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          onClick={toggleFavorite}
        >
          <FaHeart className="text-gray-400 hover:text-red-500" />
        </button>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold line-clamp-1">{property.title}</h3>
          <div className="text-accent font-bold">
            {property.listingType === "sale" 
              ? `₴${formatPrice(property.price)}` 
              : `₴${formatPrice(property.price)}/міс`
            }
          </div>
        </div>
        
        <div className="text-gray-500 text-sm mb-3">
          {`${property.city}, ${property.district}`}
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>
        
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FaRulerCombined className="text-gray-400 mr-1" />
              <span className="text-gray-700">{`${property.area} м²`}</span>
            </div>
            <div className="flex items-center">
              <FaBed className="text-gray-400 mr-1" />
              <span className="text-gray-700">{`${property.rooms} кімн.`}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/90 p-0"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/properties/${property.id}`);
            }}
          >
            Деталі
          </Button>
        </div>
      </div>
    </div>
  );
}
