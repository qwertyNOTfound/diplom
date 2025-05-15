import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface FilterSidebarProps {
  onFilterChange: (filters: FilterValues) => void;
  className?: string;
}

export interface FilterValues {
  listingType?: string;
  propertyType?: string;
  region?: string;
  city?: string;
  district?: string;
  priceMin?: string;
  priceMax?: string;
  rooms?: string;
  area?: string;
}

export function FilterSidebar({ onFilterChange, className = "" }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterValues>({
    listingType: "",
    propertyType: "",
    region: "",
    city: "",
    district: "",
    priceMin: "",
    priceMax: "",
    rooms: "",
    area: "",
  });

  const handleChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  const resetFilters = () => {
    setFilters({
      listingType: "",
      propertyType: "",
      region: "",
      city: "",
      district: "",
      priceMin: "",
      priceMax: "",
      rooms: "",
      area: "",
    });
    onFilterChange({});
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">Фільтри пошуку</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label className="block text-gray-700 mb-2 font-medium">Тип оголошення</Label>
            <Select
              value={filters.listingType}
              onValueChange={(value) => handleChange("listingType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Всі варіанти" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Всі варіанти</SelectItem>
                <SelectItem value="sale">Продаж</SelectItem>
                <SelectItem value="rent">Оренда</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-gray-700 mb-2 font-medium">Тип нерухомості</Label>
            <Select
              value={filters.propertyType}
              onValueChange={(value) => handleChange("propertyType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Всі типи" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Всі типи</SelectItem>
                <SelectItem value="apartment">Квартира</SelectItem>
                <SelectItem value="house">Будинок</SelectItem>
                <SelectItem value="commercial">Комерційна</SelectItem>
                <SelectItem value="land">Земельна ділянка</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-gray-700 mb-2 font-medium">Область</Label>
            <Select
              value={filters.region}
              onValueChange={(value) => handleChange("region", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Всі області" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Всі області</SelectItem>
                <SelectItem value="Київська область">Київська область</SelectItem>
                <SelectItem value="Львівська область">Львівська область</SelectItem>
                <SelectItem value="Одеська область">Одеська область</SelectItem>
                <SelectItem value="Харківська область">Харківська область</SelectItem>
                <SelectItem value="Дніпропетровська область">Дніпропетровська область</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-gray-700 mb-2 font-medium">Місто</Label>
            <Select
              value={filters.city}
              onValueChange={(value) => handleChange("city", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Всі міста" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Всі міста</SelectItem>
                <SelectItem value="Київ">Київ</SelectItem>
                <SelectItem value="Львів">Львів</SelectItem>
                <SelectItem value="Одеса">Одеса</SelectItem>
                <SelectItem value="Харків">Харків</SelectItem>
                <SelectItem value="Дніпро">Дніпро</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="block text-gray-700 mb-2 font-medium">Ціна</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Від"
                value={filters.priceMin}
                onChange={(e) => handleChange("priceMin", e.target.value)}
                className="w-full"
              />
              <span>-</span>
              <Input
                type="number"
                placeholder="До"
                value={filters.priceMax}
                onChange={(e) => handleChange("priceMax", e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <Label className="block text-gray-700 mb-2 font-medium">Кількість кімнат</Label>
            <Select
              value={filters.rooms}
              onValueChange={(value) => handleChange("rooms", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Всі варіанти" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Всі варіанти</SelectItem>
                <SelectItem value="1">1 кімната</SelectItem>
                <SelectItem value="2">2 кімнати</SelectItem>
                <SelectItem value="3">3 кімнати</SelectItem>
                <SelectItem value="4">4 кімнати</SelectItem>
                <SelectItem value="5">5+ кімнат</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 space-y-2">
            <Button type="submit" className="w-full">
              Застосувати фільтри
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={resetFilters}
            >
              Скинути фільтри
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
