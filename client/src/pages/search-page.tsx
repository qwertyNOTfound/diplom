import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearch, useLocation } from "wouter";
import { Property } from "@shared/schema";

import PropertyCard from "@/components/property-card";
import FilterSidebar from "@/components/filter-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface FilterValues {
  dealType: string;
  propertyType: string;
  region: string;
  city: string;
  district: string;
  priceMin: string;
  priceMax: string;
  rooms: string[];
  areaMin: string;
  areaMax: string;
  sortBy: string;
}

export default function SearchPage() {
  const search = useSearch();
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterValues>({
    dealType: "all",
    propertyType: "all",
    region: "",
    city: "",
    district: "",
    priceMin: "",
    priceMax: "",
    rooms: [],
    areaMin: "",
    areaMax: "",
    sortBy: "newest",
  });

  // Parse URL parameters on first load
  useEffect(() => {
    const params = new URLSearchParams(search);
    const newFilters = { ...filters };
    
    if (params.has("dealType")) newFilters.dealType = params.get("dealType") || "all";
    if (params.has("propertyType")) newFilters.propertyType = params.get("propertyType") || "all";
    if (params.has("region")) newFilters.region = params.get("region") || "";
    if (params.has("city")) newFilters.city = params.get("city") || "";
    if (params.has("district")) newFilters.district = params.get("district") || "";
    if (params.has("priceMin")) newFilters.priceMin = params.get("priceMin") || "";
    if (params.has("priceMax")) newFilters.priceMax = params.get("priceMax") || "";
    if (params.has("rooms")) {
      const roomsParam = params.getAll("rooms");
      if (roomsParam.length > 0) newFilters.rooms = roomsParam;
    }
    if (params.has("areaMin")) newFilters.areaMin = params.get("areaMin") || "";
    if (params.has("areaMax")) newFilters.areaMax = params.get("areaMax") || "";
    if (params.has("sortBy")) newFilters.sortBy = params.get("sortBy") || "newest";
    if (params.has("page")) setCurrentPage(parseInt(params.get("page") || "1"));
    
    setFilters(newFilters);
  }, [search]);

  // Fetch properties with filters
  const { data, isLoading, isError } = useQuery<Property[]>({
    queryKey: ["/api/properties", { ...filters, page: currentPage }],
  });

  // Items per page for pagination
  const itemsPerPage = 8;
  
  // Calculate total pages
  const totalItems = data?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Get current page properties
  const currentProperties = data?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

  // Handle filter change
  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL with filter parameters
    const params = new URLSearchParams();
    if (newFilters.dealType !== "all") params.append("dealType", newFilters.dealType);
    if (newFilters.propertyType !== "all") params.append("propertyType", newFilters.propertyType);
    if (newFilters.region) params.append("region", newFilters.region);
    if (newFilters.city) params.append("city", newFilters.city);
    if (newFilters.district) params.append("district", newFilters.district);
    if (newFilters.priceMin) params.append("priceMin", newFilters.priceMin);
    if (newFilters.priceMax) params.append("priceMax", newFilters.priceMax);
    if (newFilters.rooms.length > 0) {
      newFilters.rooms.forEach(room => params.append("rooms", room));
    }
    if (newFilters.areaMin) params.append("areaMin", newFilters.areaMin);
    if (newFilters.areaMax) params.append("areaMax", newFilters.areaMax);
    if (newFilters.sortBy !== "newest") params.append("sortBy", newFilters.sortBy);
    
    setLocation(`/search?${params.toString()}`);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const newFilters = { ...filters, sortBy: value };
    handleFilterChange(newFilters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Update URL with page parameter
    const params = new URLSearchParams(search);
    params.set("page", page.toString());
    setLocation(`/search?${params.toString()}`);
  };

  // Get active filters count for mobile view
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dealType !== "all") count++;
    if (filters.propertyType !== "all") count++;
    if (filters.region) count++;
    if (filters.city) count++;
    if (filters.district) count++;
    if (filters.priceMin) count++;
    if (filters.priceMax) count++;
    if (filters.rooms.length > 0) count++;
    if (filters.areaMin) count++;
    if (filters.areaMax) count++;
    return count;
  };

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Знайдіть нерухомість</h1>
        <p className="text-gray-600">Використовуйте фільтри для пошуку ідеального варіанту</p>
      </div>

      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex justify-between items-center"
        >
          <span>Фільтри</span>
          {getActiveFiltersCount() > 0 && (
            <Badge className="ml-2 bg-primary">{getActiveFiltersCount()}</Badge>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <FilterSidebar
          onFilter={handleFilterChange}
          className={`${showMobileFilters ? 'block' : 'hidden'} lg:block`}
        />

        {/* Property Listings */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex justify-between items-center flex-wrap gap-2">
            <div className="text-gray-600">
              {isLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  <span>Завантаження...</span>
                </div>
              ) : isError ? (
                <div className="flex items-center text-red-500">
                  <Info className="h-4 w-4 mr-2" />
                  <span>Помилка завантаження даних</span>
                </div>
              ) : (
                <span>
                  Знайдено <span className="font-bold">{totalItems}</span> оголошень
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="sort-by" className="text-sm text-gray-600">
                Сортувати за:
              </label>
              <Select
                value={filters.sortBy}
                onValueChange={handleSortChange}
              >
                <SelectTrigger id="sort-by" className="w-[180px]">
                  <SelectValue placeholder="Сортування" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Найновіші</SelectItem>
                  <SelectItem value="price-asc">Ціна (від низької)</SelectItem>
                  <SelectItem value="price-desc">Ціна (від високої)</SelectItem>
                  <SelectItem value="area-asc">Площа (від меншої)</SelectItem>
                  <SelectItem value="area-desc">Площа (від більшої)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      <div className="h-6 w-24 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    <div className="flex justify-between">
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            // Error state
            <div className="bg-red-50 p-6 rounded-lg text-center">
              <p className="text-red-500">
                Сталася помилка при завантаженні даних. Спробуйте пізніше або зверніться до підтримки.
              </p>
            </div>
          ) : currentProperties.length > 0 ? (
            // Properties grid
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            // Empty state
            <div className="bg-gray-50 p-12 rounded-lg text-center">
              <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Не знайдено жодного оголошення
              </h3>
              <p className="text-gray-500 mb-6">
                Спробуйте змінити параметри фільтрації або перегляньте всі доступні оголошення
              </p>
              <Button
                variant="outline"
                onClick={() => handleFilterChange({
                  dealType: "all",
                  propertyType: "all",
                  region: "",
                  city: "",
                  district: "",
                  priceMin: "",
                  priceMax: "",
                  rooms: [],
                  areaMin: "",
                  areaMax: "",
                  sortBy: "newest",
                })}
              >
                Скинути фільтри
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow-sm">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-l-lg"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Попередня
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first, last, current and 1 page on each side of current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, i, arr) => {
                    // Add ellipsis when needed
                    const showEllipsisBefore = i > 0 && arr[i - 1] !== page - 1;
                    const showEllipsisAfter = i < arr.length - 1 && arr[i + 1] !== page + 1;
                    
                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsisBefore && (
                          <div className="px-3 py-2 border border-gray-300 bg-white text-gray-500">
                            ...
                          </div>
                        )}
                        
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => handlePageChange(page)}
                          className={`rounded-none ${currentPage === page ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                          {page}
                        </Button>
                        
                        {showEllipsisAfter && (
                          <div className="px-3 py-2 border border-gray-300 bg-white text-gray-500">
                            ...
                          </div>
                        )}
                      </div>
                    );
                  })}
                
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-r-lg"
                >
                  Наступна
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
