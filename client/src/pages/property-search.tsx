import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { PropertyFilter } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { propertyFilterSchema } from '@shared/schema';
import PropertyGrid from '@/components/listings/PropertyGrid';

export default function PropertySearch() {
  const [, navigate] = useLocation();
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const form = useForm<PropertyFilter>({
    resolver: zodResolver(propertyFilterSchema),
    defaultValues: {
      listingType: 'all',
      propertyType: 'all',
      region: '',
      city: '',
      district: '',
      priceMin: '',
      priceMax: '',
      areaMin: '',
      areaMax: '',
      rooms: '',
    },
  });

  // Convert form values to query params
  const getQueryParams = (values: PropertyFilter) => {
    const params = new URLSearchParams();
    
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  };

  // Fetch properties with optional filters
  const { data: properties, isLoading } = useQuery({
    queryKey: [`/api/properties?${getQueryParams(form.watch())}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0] as string);
      if (!res.ok) {
        throw new Error('Failed to fetch properties');
      }
      return res.json();
    },
  });

  const onSubmit = (values: PropertyFilter) => {
    // Re-fetch with new filters
    const queryParams = getQueryParams(values);
    navigate(`/properties${queryParams ? `?${queryParams}` : ''}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-primary-600 py-8 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Пошук нерухомості</h1>
          <p className="mt-2 opacity-90">Знайдіть ідеальний варіант серед всіх доступних пропозицій</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Фільтри пошуку</h2>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="listingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Тип оголошення</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Всі варіанти" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">Всі варіанти</SelectItem>
                              <SelectItem value="sale">Продаж</SelectItem>
                              <SelectItem value="rent">Оренда</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Тип нерухомості</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Всі типи" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="all">Всі типи</SelectItem>
                              <SelectItem value="apartment">Квартира</SelectItem>
                              <SelectItem value="house">Будинок</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Область</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Введіть область"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Місто</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Введіть місто"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Район</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Введіть район"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <div>
                      <FormLabel>Ціна</FormLabel>
                      <div className="flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name="priceMin"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="Від"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span>-</span>
                        <FormField
                          control={form.control}
                          name="priceMax"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  placeholder="До"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="rooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Кількість кімнат</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Всі варіанти" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Всі варіанти</SelectItem>
                              <SelectItem value="1">1 кімната</SelectItem>
                              <SelectItem value="2">2 кімнати</SelectItem>
                              <SelectItem value="3">3 кімнати</SelectItem>
                              <SelectItem value="4">4 кімнати</SelectItem>
                              <SelectItem value="5">5+ кімнат</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    {/* Advanced filters toggle */}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full flex items-center justify-center text-primary"
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    >
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      <span>Розширений пошук</span>
                      {showAdvancedFilters ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                    
                    {showAdvancedFilters && (
                      <div className="space-y-5 pt-2 border-t border-gray-200">
                        <div>
                          <FormLabel>Площа (м²)</FormLabel>
                          <div className="flex items-center space-x-2">
                            <FormField
                              control={form.control}
                              name="areaMin"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number" 
                                      placeholder="Від"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <span>-</span>
                            <FormField
                              control={form.control}
                              name="areaMax"
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      type="number" 
                                      placeholder="До"
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full"
                      >
                        Застосувати фільтри
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {/* Property Listings */}
          <div className="lg:w-3/4">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-2xl font-bold">
                  Знайдено оголошень: <span>{properties?.length || 0}</span>
                </h2>
                <p className="text-gray-600">Перегляньте доступні пропозиції</p>
              </div>
              
              <div className="flex items-center">
                <Select>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Сортувати за" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">За датою (новіші)</SelectItem>
                    <SelectItem value="priceAsc">За ціною (зростання)</SelectItem>
                    <SelectItem value="priceDesc">За ціною (спадання)</SelectItem>
                    <SelectItem value="areaAsc">За площею (зростання)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <PropertyGrid 
              properties={properties || []} 
              isLoading={isLoading} 
              layout="list"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
