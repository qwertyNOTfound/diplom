import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertPropertySchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

// Extended schema for the form with more validation
const propertyFormSchema = insertPropertySchema.extend({
  images: z.string().array().min(1, {
    message: "Додайте хоча б одне фото",
  }),
  confirmTerms: z.boolean().refine((val) => val === true, {
    message: "Ви повинні прийняти умови",
  }),
});

// Create a type from the schema
type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function PropertyForm() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [tempImages, setTempImages] = useState<string[]>([]);

  // Create form
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      area: 0,
      rooms: 0,
      floor: 0,
      propertyType: "apartment",
      dealType: "sale",
      region: "",
      city: "",
      district: "",
      address: "",
      images: [],
      amenities: [],
      contactFirstName: "",
      contactLastName: "",
      contactMiddleName: "",
      contactPhone: "",
      contactEmail: "",
      contactAvailability: "any",
      confirmTerms: false,
    },
  });

  // Define the step structure
  const steps = [
    {
      title: "Основна інформація",
      fields: ["dealType", "propertyType", "region", "city", "district", "address"],
    },
    {
      title: "Деталі нерухомості",
      fields: ["title", "description", "price", "area", "rooms", "floor", "amenities"],
    },
    {
      title: "Фотографії",
      fields: ["images"],
    },
    {
      title: "Контактна інформація",
      fields: [
        "contactFirstName",
        "contactLastName",
        "contactMiddleName",
        "contactPhone",
        "contactEmail",
        "contactAvailability",
        "confirmTerms",
      ],
    },
  ];

  // Create mutation for submitting property
  const createPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormValues) => {
      const res = await apiRequest("POST", "/api/properties", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Успіх!",
        description: "Оголошення створено та відправлено на модерацію",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-properties"] });
      setLocation("/profile");
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка!",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle next step
  const handleNextStep = async () => {
    const currentFields = steps[currentStep].fields;
    const output = await form.trigger(currentFields as any);
    
    if (!output) return;
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Preview images and convert to base64 strings
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setTempImages((prev) => [...prev, e.target!.result as string]);
          form.setValue("images", [...tempImages, e.target!.result as string]);
          form.trigger("images");
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    const newImages = [...tempImages];
    newImages.splice(index, 1);
    setTempImages(newImages);
    form.setValue("images", newImages);
    form.trigger("images");
  };

  // Submit the form
  const onSubmit = (data: PropertyFormValues) => {
    createPropertyMutation.mutate(data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">{steps[currentStep].title}</h2>

      {/* Step indicators */}
      <div className="flex mb-8">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 relative">
            {index > 0 && (
              <div
                className={`absolute top-4 left-0 right-0 h-0.5 ${
                  index <= currentStep ? "bg-primary" : "bg-gray-300"
                } -z-1`}
              ></div>
            )}
            <div className="step-indicator flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mb-1 ${
                  index <= currentStep ? "bg-primary" : "bg-gray-300"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs text-gray-600">{step.title}</span>
            </div>
          </div>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Information */}
          <div className={currentStep === 0 ? "block" : "hidden"}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="dealType"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel required>Тип угоди</FormLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0 border border-gray-300 rounded-lg p-3">
                        <FormControl>
                          <RadioGroupItem value="sale" />
                        </FormControl>
                        <FormLabel className="font-normal">Продаж</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0 border border-gray-300 rounded-lg p-3">
                        <FormControl>
                          <RadioGroupItem value="rent" />
                        </FormControl>
                        <FormLabel className="font-normal">Оренда</FormLabel>
                      </FormItem>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Тип нерухомості</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть тип нерухомості" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apartment">Квартира</SelectItem>
                        <SelectItem value="house">Будинок</SelectItem>
                        <SelectItem value="commercial">Комерційна нерухомість</SelectItem>
                        <SelectItem value="land">Земельна ділянка</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Область</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть область" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kyiv">Київська</SelectItem>
                        <SelectItem value="lviv">Львівська</SelectItem>
                        <SelectItem value="odesa">Одеська</SelectItem>
                        <SelectItem value="kharkiv">Харківська</SelectItem>
                        <SelectItem value="dnipro">Дніпропетровська</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Місто/Населений пункт</FormLabel>
                    <FormControl>
                      <Input placeholder="Введіть місто" {...field} />
                    </FormControl>
                    <FormMessage />
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
                      <Input placeholder="Введіть район" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Адреса</FormLabel>
                    <FormControl>
                      <Input placeholder="Введіть адресу" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Step 2: Property Details */}
          <div className={currentStep === 1 ? "block" : "hidden"}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Заголовок оголошення</FormLabel>
                    <FormControl>
                      <Input placeholder="Введіть заголовок" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Опис</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Детальний опис нерухомості"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Ціна, ₴</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Площа, м²</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rooms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Кількість кімнат</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Оберіть кількість кімнат" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0">Студія</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                          <SelectItem value="5">5+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Поверх</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Введіть поверх"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="amenities"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Зручності</FormLabel>
                      <FormDescription>
                        Оберіть зручності, що доступні у нерухомості
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "parking", label: "Паркінг" },
                        { id: "furniture", label: "Меблі" },
                        { id: "ac", label: "Кондиціонер" },
                        { id: "balcony", label: "Балкон" },
                        { id: "elevator", label: "Ліфт" },
                        { id: "security", label: "Охорона" },
                      ].map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="amenities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Step 3: Photos */}
          <div className={currentStep === 2 ? "block" : "hidden"}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="images"
                render={() => (
                  <FormItem>
                    <FormLabel required>Фотографії нерухомості</FormLabel>
                    <FormDescription>
                      Завантажте до 10 фотографій (формати: JPG, PNG; макс. розмір: 5 МБ)
                    </FormDescription>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        id="property-photos"
                        type="file"
                        multiple
                        accept="image/jpeg,image/png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="property-photos"
                        className="cursor-pointer block"
                      >
                        <div className="flex flex-col items-center justify-center py-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-10 w-10 text-gray-400 mb-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-primary font-medium">
                            Натисніть, щоб вибрати фотографії
                          </span>
                          <span className="text-gray-500 text-sm">
                            або перетягніть їх сюди
                          </span>
                        </div>
                      </label>
                    </div>

                    {/* Image preview */}
                    {tempImages.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {tempImages.map((src, index) => (
                          <div key={index} className="relative">
                            <img
                              src={src}
                              alt={`Property photo ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Step 4: Contact Information */}
          <div className={currentStep === 3 ? "block" : "hidden"}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="contactFirstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Ім'я</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactLastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Прізвище</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactMiddleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>По батькові</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Телефон</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contactAvailability"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Бажаний час для зв'язку</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Оберіть час" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="any">Будь-який час</SelectItem>
                        <SelectItem value="morning">Ранок (8:00 - 12:00)</SelectItem>
                        <SelectItem value="afternoon">
                          День (12:00 - 17:00)
                        </SelectItem>
                        <SelectItem value="evening">
                          Вечір (17:00 - 21:00)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmTerms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel required>
                        Я підтверджую, що ознайомлений з{" "}
                        <a href="/terms" className="text-primary hover:text-blue-600">
                          правилами розміщення оголошень
                        </a>{" "}
                        та надаю згоду на обробку моїх персональних даних
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevStep}
                className="border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Назад
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="bg-primary hover:bg-blue-600 text-white ml-auto"
              >
                Далі
              </Button>
            ) : (
              <Button
                type="submit"
                className="bg-primary hover:bg-blue-600 text-white ml-auto"
                disabled={createPropertyMutation.isPending}
              >
                {createPropertyMutation.isPending
                  ? "Створення..."
                  : "Створити оголошення"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
