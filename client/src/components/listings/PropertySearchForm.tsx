import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertyFilterSchema, type PropertyFilter } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "wouter";
import { z } from "zod";

interface PropertySearchFormProps {
  minimal?: boolean;
  initialValues?: Partial<PropertyFilter>;
}

export default function PropertySearchForm({
  minimal = false,
  initialValues,
}: PropertySearchFormProps) {
  const [, navigate] = useLocation();

  // Create a minimal schema for the minimal form
  const minimalSearchSchema = z.object({
    listingType: z.enum(["sale", "rent", "all"]).optional(),
    city: z.string().optional(),
    priceMax: z.string().optional(),
  });

  // Use either the minimal or full schema based on props
  const schema = minimal ? minimalSearchSchema : propertyFilterSchema;
  
  // Setup the form with React Hook Form
  const form = useForm<PropertyFilter>({
    resolver: zodResolver(schema),
    defaultValues: {
      listingType: "all",
      propertyType: "all",
      region: "",
      city: "",
      district: "",
      priceMin: "",
      priceMax: "",
      areaMin: "",
      areaMax: "",
      rooms: "",
      ...initialValues,
    },
  });

  // Convert form values to query params
  const getQueryParams = (values: PropertyFilter) => {
    const params = new URLSearchParams();
    
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.append(key, value.toString());
      }
    });
    
    return params.toString();
  };

  // Form submission handler
  const onSubmit = (values: PropertyFilter) => {
    const queryParams = getQueryParams(values);
    navigate(`/properties${queryParams ? `?${queryParams}` : ""}`);
  };

  if (minimal) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Місто</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Введіть місто" />
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
                    {...field}
                    type="number"
                    placeholder="Максимальна ціна"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="md:col-span-3 flex justify-center mt-2">
            <Button type="submit" className="px-8">
              Знайти
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // Full search form
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Input {...field} placeholder="Введіть область" />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Місто</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Введіть місто" />
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
                  <Input {...field} placeholder="Введіть район" />
                </FormControl>
              </FormItem>
            )}
          />
          
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="priceMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ціна від</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Мінімальна ціна"
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
                    {...field}
                    type="number"
                    placeholder="Максимальна ціна"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="areaMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Площа від (м²)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Мінімальна площа"
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
                <FormLabel>Площа до (м²)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Максимальна площа"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-center">
          <Button type="submit" className="px-8">
            Знайти
          </Button>
        </div>
      </form>
    </Form>
  );
}
