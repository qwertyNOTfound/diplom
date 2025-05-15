import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { FilterSidebar, FilterValues } from "@/components/ui/filter-sidebar";
import { PropertyCard } from "@/components/ui/property-card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { ListingWithPhotos } from "@shared/schema";

export default function PropertiesPage() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<FilterValues>({});
  const [sortBy, setSortBy] = useState<string>("newest");
  
  // Parse query string parameters on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const initialFilters: FilterValues = {};
    
    if (searchParams.has("city")) initialFilters.city = searchParams.get("city") || "";
    if (searchParams.has("region")) initialFilters.region = searchParams.get("region") || "";
    if (searchParams.has("district")) initialFilters.district = searchParams.get("district") || "";
    if (searchParams.has("listingType")) initialFilters.listingType = searchParams.get("listingType") || "";
    if (searchParams.has("propertyType")) initialFilters.propertyType = searchParams.get("propertyType") || "";
    if (searchParams.has("priceMin")) initialFilters.priceMin = searchParams.get("priceMin") || "";
    if (searchParams.has("priceMax")) initialFilters.priceMax = searchParams.get("priceMax") || "";
    if (searchParams.has("rooms")) initialFilters.rooms = searchParams.get("rooms") || "";
    
    setFilters(initialFilters);
  }, [location]);
  
  // Construct the filter query string
  const filterQueryString = Object.entries(filters)
    .filter(([_, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  
  // Fetch properties with filter
  const { data: properties, isLoading } = useQuery<ListingWithPhotos[]>({
    queryKey: [`/api/listings${filterQueryString ? `?${filterQueryString}` : ""}`],
  });
  
  // Apply sorting to the properties
  const sortedProperties = properties ? [...properties].sort((a, b) => {
    switch (sortBy) {
      case "price_asc":
        return a.price - b.price;
      case "price_desc":
        return b.price - a.price;
      case "area_asc":
        return a.area - b.area;
      case "area_desc":
        return b.area - a.area;
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  }) : [];
  
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
  };
  
  const handleFavoriteClick = (id: number) => {
    // Implement favorite functionality
    console.log(`Toggled favorite for listing ${id}`);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-primary py-8 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Оголошення про нерухомість</h1>
          <p className="mt-2 opacity-90">Знайдіть ідеальний варіант серед всіх доступних пропозицій</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <FilterSidebar 
              onFilterChange={handleFilterChange} 
              className="sticky top-24" 
            />
          </div>
          
          {/* Property Listings */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl font-bold">
                  Знайдено оголошень: <span>{sortedProperties?.length || 0}</span>
                </h2>
                <p className="text-gray-600">Перегляньте доступні пропозиції</p>
              </div>
              <div className="flex items-center">
                <label className="mr-2 text-gray-700">Сортувати:</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="За датою (новіші)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">За датою (новіші)</SelectItem>
                    <SelectItem value="price_asc">За ціною (зростання)</SelectItem>
                    <SelectItem value="price_desc">За ціною (спадання)</SelectItem>
                    <SelectItem value="area_asc">За площею (зростання)</SelectItem>
                    <SelectItem value="area_desc">За площею (спадання)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : sortedProperties && sortedProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sortedProperties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    listing={property} 
                    onFavoriteClick={handleFavoriteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <h3 className="text-xl font-bold mb-2">Нічого не знайдено</h3>
                <p className="text-gray-600 mb-4">
                  На жаль, за вашим запитом не знайдено жодного оголошення. 
                  Спробуйте змінити параметри фільтрації.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({})}
                >
                  Скинути фільтри
                </Button>
              </div>
            )}
            
            {/* Pagination - To be implemented when needed */}
            {/* <div className="mt-10 flex justify-center">
              <div className="flex items-center space-x-1">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
