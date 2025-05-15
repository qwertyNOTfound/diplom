import { Property } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Ruler, DoorOpen } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
  onToggleFavorite?: (propertyId: number, isFavorite: boolean) => void;
  layout?: "grid" | "list";
}

export default function PropertyCard({
  property,
  isFavorite = false,
  onToggleFavorite,
  layout = "grid",
}: PropertyCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isFav, setIsFav] = useState(isFavorite);
  const [isHovered, setIsHovered] = useState(false);

  const listingTypeText = property.listingType === "sale" ? "Продаж" : "Оренда";
  const propertyTypeText = property.propertyType === "apartment" ? "Квартира" : "Будинок";
  const priceText = property.listingType === "sale" 
    ? `${property.price.toLocaleString()} грн` 
    : `${property.price.toLocaleString()} грн/міс`;

  // Format date for display
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA");
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Потрібна авторизація",
        description: "Будь ласка, увійдіть або зареєструйтеся, щоб додавати об'єкти до обраного",
        variant: "default",
      });
      navigate("/auth");
      return;
    }

    try {
      if (isFav) {
        await apiRequest("DELETE", `/api/favorites/${property.id}`);
      } else {
        await apiRequest("POST", `/api/favorites/${property.id}`);
      }
      
      setIsFav(!isFav);
      
      if (onToggleFavorite) {
        onToggleFavorite(property.id, !isFav);
      }
      
      // Invalidate favorites cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      
      toast({
        title: "Успішно",
        description: isFav 
          ? "Об'єкт видалено з обраного" 
          : "Об'єкт додано до обраного",
      });
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити статус обраного",
        variant: "destructive",
      });
    }
  };

  return (
    <Card 
      className={`property-card overflow-hidden hover:shadow-lg transition ${
        layout === "list" ? "flex flex-col md:flex-row" : ""
      }`}
      onClick={() => navigate(`/properties/${property.id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`relative ${
          layout === "list" ? "md:w-1/3 h-52 md:h-auto" : "h-52"
        }`}
      >
        <img 
          src={property.photos[0]} 
          alt={property.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className={`${property.listingType === 'sale' ? 'bg-amber-500' : 'bg-primary'} text-white text-sm font-medium px-2 py-1 rounded`}>
            {listingTypeText}
          </span>
        </div>
        <button 
          className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition"
          onClick={handleToggleFavorite}
        >
          <Heart 
            className={`h-5 w-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-slate-700'}`} 
          />
        </button>
        <div className={`property-overlay absolute inset-0 bg-black bg-opacity-30 opacity-0 transition-opacity flex items-center justify-center ${isHovered ? 'opacity-100' : ''}`}>
          <Button 
            variant="default" 
            className="bg-white text-primary hover:bg-gray-100"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/properties/${property.id}`);
            }}
          >
            Детальніше
          </Button>
        </div>
      </div>
      
      <CardContent className={`p-5 ${layout === "list" ? "md:w-2/3" : ""}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-secondary mb-1">{priceText}</h3>
            <p className="text-slate-700 font-medium">
              {property.rooms}-кімн. {propertyTypeText.toLowerCase()}, {property.area} м²
            </p>
          </div>
        </div>
        
        <p className="text-slate-600 my-3 flex items-center">
          <MapPin className="h-4 w-4 mr-1 text-slate-400" />
          {property.city}, {property.district}
        </p>
        
        {layout === "list" && (
          <p className="text-slate-700 line-clamp-2 mb-3">{property.description}</p>
        )}
        
        <div className="flex gap-4 text-slate-700">
          <div className="flex items-center">
            <DoorOpen className="mr-2 h-4 w-4 text-slate-400" />
            <span>{property.rooms} кімн.</span>
          </div>
          <div className="flex items-center">
            <Ruler className="mr-2 h-4 w-4 text-slate-400" />
            <span>{property.area} м²</span>
          </div>
        </div>
        
        <div className="mt-5 pt-5 border-t border-slate-200 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-slate-600 text-sm">{formatDate(property.createdAt)}</span>
          </div>
          <Button 
            variant="link" 
            className="text-primary p-0 h-6"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/properties/${property.id}`);
            }}
          >
            Детальніше
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
