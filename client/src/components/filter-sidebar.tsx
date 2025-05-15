import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

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

interface FilterSidebarProps {
  onFilter: (filters: FilterValues) => void;
  className?: string;
}

export default function FilterSidebar({ onFilter, className = "" }: FilterSidebarProps) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (value: string, checked: boolean) => {
    setFilters(prev => {
      const newRooms = checked
        ? [...prev.rooms, value]
        : prev.rooms.filter(room => room !== value);
      return { ...prev, rooms: newRooms };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({
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
    onFilter({
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
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <h3 className="font-bold text-xl mb-4">Фільтри</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="dealType">Тип угоди</Label>
          <Select
            value={filters.dealType}
            onValueChange={(value) => handleSelectChange("dealType", value)}
          >
            <SelectTrigger id="dealType" className="w-full">
              <SelectValue placeholder="Оберіть тип угоди" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі типи</SelectItem>
              <SelectItem value="sale">Продаж</SelectItem>
              <SelectItem value="rent">Оренда</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="propertyType">Тип нерухомості</Label>
          <Select
            value={filters.propertyType}
            onValueChange={(value) => handleSelectChange("propertyType", value)}
          >
            <SelectTrigger id="propertyType" className="w-full">
              <SelectValue placeholder="Оберіть тип нерухомості" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Всі типи</SelectItem>
              <SelectItem value="apartment">Квартира</SelectItem>
              <SelectItem value="house">Будинок</SelectItem>
              <SelectItem value="commercial">Комерційна</SelectItem>
              <SelectItem value="land">Земельна ділянка</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="region">Область</Label>
          <Select
            value={filters.region}
            onValueChange={(value) => handleSelectChange("region", value)}
          >
            <SelectTrigger id="region" className="w-full">
              <SelectValue placeholder="Оберіть область" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Всі області</SelectItem>
              <SelectItem value="kyiv">Київська</SelectItem>
              <SelectItem value="lviv">Львівська</SelectItem>
              <SelectItem value="odesa">Одеська</SelectItem>
              <SelectItem value="dnipro">Дніпропетровська</SelectItem>
              <SelectItem value="kharkiv">Харківська</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="city">Місто</Label>
          <Input
            type="text"
            id="city"
            name="city"
            placeholder="Введіть місто"
            value={filters.city}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="district">Район</Label>
          <Input
            type="text"
            id="district"
            name="district"
            placeholder="Введіть район"
            value={filters.district}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>

        <div>
          <Label>Ціна</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              id="priceMin"
              name="priceMin"
              placeholder="Від"
              value={filters.priceMin}
              onChange={handleInputChange}
              className="w-full"
            />
            <Input
              type="number"
              id="priceMax"
              name="priceMax"
              placeholder="До"
              value={filters.priceMax}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <Label>Кількість кімнат</Label>
          <div className="flex space-x-4 mt-1">
            {[1, 2, 3, 4].map((room) => (
              <div key={room} className="flex items-center space-x-2">
                <Checkbox
                  id={`room-${room}`}
                  checked={filters.rooms.includes(room.toString())}
                  onCheckedChange={(checked) => {
                    handleCheckboxChange(room.toString(), checked as boolean);
                  }}
                />
                <label
                  htmlFor={`room-${room}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {room === 4 ? "4+" : room}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Площа, м²</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              id="areaMin"
              name="areaMin"
              placeholder="Від"
              value={filters.areaMin}
              onChange={handleInputChange}
              className="w-full"
            />
            <Input
              type="number"
              id="areaMax"
              name="areaMax"
              placeholder="До"
              value={filters.areaMax}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="sortBy">Сортування</Label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => handleSelectChange("sortBy", value)}
          >
            <SelectTrigger id="sortBy" className="w-full">
              <SelectValue placeholder="Оберіть сортування" />
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

        <div className="flex flex-col space-y-2">
          <Button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white">
            Застосувати фільтри
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full border-gray-300 hover:bg-gray-100 text-gray-700"
            onClick={handleReset}
          >
            Скинути
          </Button>
        </div>
      </form>
    </div>
  );
}
