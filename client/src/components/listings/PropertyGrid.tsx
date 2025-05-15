import { Property } from "@shared/schema";
import PropertyCard from "./PropertyCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface PropertyGridProps {
  properties: Property[];
  isLoading?: boolean;
  layout?: "grid" | "list";
  showPagination?: boolean;
  itemsPerPage?: number;
  emptyMessage?: string;
}

export default function PropertyGrid({
  properties,
  isLoading = false,
  layout = "grid",
  showPagination = false,
  itemsPerPage = 6,
  emptyMessage = "Не знайдено жодного оголошення",
}: PropertyGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [totalPages, setTotalPages] = useState(1);
  const { user } = { user: null }; // Access this from your auth context

  // Load favorites if user is logged in
  const { data: favoritesData } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return res.json();
    },
  });

  // Update favorites set when favorites data changes
  useEffect(() => {
    if (favoritesData) {
      const favoriteIds = new Set(favoritesData.map((fav: Property) => fav.id));
      setFavorites(favoriteIds);
    }
  }, [favoritesData]);

  // Update total pages when properties change
  useEffect(() => {
    setTotalPages(Math.ceil(properties.length / itemsPerPage));
  }, [properties, itemsPerPage]);

  // Get properties for current page
  const currentProperties = showPagination
    ? properties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : properties;

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle favorite toggle
  const handleToggleFavorite = (propertyId: number, isFavorite: boolean) => {
    const newFavorites = new Set(favorites);
    if (isFavorite) {
      newFavorites.add(propertyId);
    } else {
      newFavorites.delete(propertyId);
    }
    setFavorites(newFavorites);
  };

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 ${
        layout === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"
      } gap-6`}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col">
            <Skeleton className="h-52 w-full rounded-t-xl" />
            <div className="p-5 border border-t-0 rounded-b-xl space-y-2">
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="text-xl font-medium text-gray-900 mb-2">{emptyMessage}</h3>
        <p className="text-gray-500">Спробуйте змінити фільтри пошуку або повернутися пізніше.</p>
      </div>
    );
  }

  return (
    <div>
      <div className={`grid grid-cols-1 ${
        layout === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-1"
      } gap-6`}>
        {currentProperties.map((property) => (
          <PropertyCard 
            key={property.id}
            property={property}
            isFavorite={favorites.has(property.id)}
            onToggleFavorite={handleToggleFavorite}
            layout={layout}
          />
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Попередня сторінка</span>
              <i className="fas fa-chevron-left" />
            </Button>
            
            {Array.from({ length: totalPages }).map((_, index) => {
              // Show first, last, current, and 1 page on each side of current
              const page = index + 1;
              const isFirstPage = page === 1;
              const isLastPage = page === totalPages;
              const isCurrentPage = page === currentPage;
              const isAdjacentPage = Math.abs(page - currentPage) === 1;
              
              if (isFirstPage || isLastPage || isCurrentPage || isAdjacentPage) {
                return (
                  <Button
                    key={page}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              } else if (
                (page === 2 && currentPage > 3) ||
                (page === totalPages - 1 && currentPage < totalPages - 2)
              ) {
                return <span key={page} className="px-2">...</span>;
              }
              
              return null;
            })}
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Наступна сторінка</span>
              <i className="fas fa-chevron-right" />
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
