import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

const filterSchema = z.object({
  listingType: z.string().optional(),
  propertyType: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  priceMin: z.string().optional(),
  priceMax: z.string().optional(),
  areaMin: z.string().optional(),
  areaMax: z.string().optional(),
  rooms: z.string().optional(),
  floor: z.string().optional(),
  floorMax: z.string().optional(),
  state: z.string().optional(),
  date: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

interface SearchFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  className?: string;
  compact?: boolean;
}

const SearchFilters = ({ onFilterChange, className = "", compact = false }: SearchFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      listingType: "all",
      propertyType: "",
      region: "",
      city: "",
      district: "",
      priceMin: "",
      priceMax: "",
      areaMin: "",
      areaMax: "",
      rooms: "",
    },
  });

  const onSubmit = (values: FilterValues) => {
    onFilterChange(values);
  };

  return (
    <Card className={className}>
      <CardContent className={compact ? "p-4" : "p-6"}>
        {!compact && (
          <h2 className={`${compact ? "text-lg" : "text-2xl"} font-bold mb-4`}>
            Фільтри пошуку
          </h2>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className={`grid grid-cols-1 ${compact ? "md:grid-cols-4" : "md:grid-cols-2"} gap-4`}>
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
                        <SelectItem value="">Всі типи</SelectItem>
                        <SelectItem value="apartment">Квартира</SelectItem>
                        <SelectItem value="house">Будинок</SelectItem>
                        <SelectItem value="townhouse">Таунхаус</SelectItem>
                        <SelectItem value="land">Земельна ділянка</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {!compact && (
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Область</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Всі області" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Всі області</SelectItem>
                          <SelectItem value="Київська область">Київська область</SelectItem>
                          <SelectItem value="Львівська область">Львівська область</SelectItem>
                          <SelectItem value="Одеська область">Одеська область</SelectItem>
                          <SelectItem value="Харківська область">Харківська область</SelectItem>
                          <SelectItem value="Дніпропетровська область">Дніпропетровська область</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Місто</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Всі міста" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Всі міста</SelectItem>
                        <SelectItem value="Київ">Київ</SelectItem>
                        <SelectItem value="Львів">Львів</SelectItem>
                        <SelectItem value="Одеса">Одеса</SelectItem>
                        <SelectItem value="Харків">Харків</SelectItem>
                        <SelectItem value="Дніпро">Дніпро</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {!compact && (
                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Район</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Всі райони" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Всі райони</SelectItem>
                          <SelectItem value="Шевченківський">Шевченківський</SelectItem>
                          <SelectItem value="Печерський">Печерський</SelectItem>
                          <SelectItem value="Голосіївський">Голосіївський</SelectItem>
                          <SelectItem value="Дніпровський">Дніпровський</SelectItem>
                          <SelectItem value="Оболонський">Оболонський</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              )}

              {!compact && (
                <>
                  <FormField
                    control={form.control}
                    name="priceMin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ціна від</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Мінімальна ціна"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priceMax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ціна до</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Максимальна ціна"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </>
              )}

              {compact && (
                <FormField
                  control={form.control}
                  name="priceMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ціна до</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Максимальна ціна"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {!compact && (
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
              )}
            </div>

            {!compact && (
              <>
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex items-center text-primary"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? (
                      <ChevronUp className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    Розширений пошук
                  </Button>
                </div>

                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <FormField
                      control={form.control}
                      name="areaMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Площа від</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Мінімальна площа"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="areaMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Площа до</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Максимальна площа"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="floor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Поверх від</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Мінімальний поверх"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="floorMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Поверх до</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Максимальний поверх"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            )}

            <div className={compact ? "md:flex md:items-end" : "pt-2 flex justify-center"}>
              <Button
                type="submit"
                className={`${compact ? "w-full" : "px-8"} bg-primary hover:bg-primary/90`}
              >
                Пошук
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
