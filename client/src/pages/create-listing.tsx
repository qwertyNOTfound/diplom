import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InsertProperty, insertPropertySchema } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, MapPin, ImagePlus, Upload, CheckCircle, X } from "lucide-react";

// Extend the property schema to handle UI specific validation
const createListingSchema = insertPropertySchema.extend({
  photos: z.array(z.string()).min(1, "Додайте хоча б одне фото"),
});

type CreateListingFormValues = z.infer<typeof createListingSchema>;

export default function CreateListing() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const totalSteps = 4;

  // Check if user is verified
  useEffect(() => {
    if (user && !user.isVerified) {
      toast({
        title: "Увага",
        description: "Для розміщення оголошень потрібно підтвердити email. Перейдіть у особистий кабінет.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [user, navigate, toast]);

  // Setup form
  const form = useForm<CreateListingFormValues>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      listingType: "sale",
      propertyType: "apartment",
      region: "",
      city: "",
      district: "",
      address: "",
      price: 0,
      area: 0,
      rooms: 1,
      photos: [],
      userId: user?.id || 0,
    },
  });

  // Watch form values for conditional logic
  const listingType = form.watch("listingType");

  // Form submission mutation
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertProperty) => {
      const res = await apiRequest("POST", "/api/properties", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Успішно",
        description: "Ваше оголошення відправлено на перевірку і незабаром буде опубліковане.",
      });
      navigate("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Помилка",
        description: error.message || "Не вдалося створити оголошення. Спробуйте пізніше.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: CreateListingFormValues) => {
    // Add the current user ID to the form data
    const propertyData: InsertProperty = {
      ...values,
      userId: user?.id || 0,
      photos: photoUrls,
    };

    mutate(propertyData);
  };

  // Mock function to simulate photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // For the purpose of this demo, we'll just use placeholder image URLs
    // In a real app, you would upload these to a server or cloud storage
    const placeholderImages = [
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    ];

    // Add placeholder images for each file selected
    const newUrls = Array.from(files).map((_, index) => {
      const randomIndex = Math.floor(Math.random() * placeholderImages.length);
      return placeholderImages[randomIndex];
    });

    setPhotoUrls((prev) => [...prev, ...newUrls]);
    
    // Update form value
    form.setValue("photos", [...photoUrls, ...newUrls]);
  };

  // Remove a photo from the list
  const removePhoto = (index: number) => {
    const updatedUrls = photoUrls.filter((_, i) => i !== index);
    setPhotoUrls(updatedUrls);
    form.setValue("photos", updatedUrls);
  };

  // Set main photo (first in the array)
  const setMainPhoto = (index: number) => {
    if (index === 0) return; // Already the main photo
    
    const newUrls = [...photoUrls];
    const [movedUrl] = newUrls.splice(index, 1);
    newUrls.unshift(movedUrl);
    
    setPhotoUrls(newUrls);
    form.setValue("photos", newUrls);
    
    toast({
      title: "Головне фото оновлено",
      description: "Фото успішно встановлено як головне.",
    });
  };

  // Go to next step
  const nextStep = () => {
    const currentFields = getFieldsForStep(step);
    
    // Validate current step fields
    const isValid = currentFields.every(fieldName => {
      const field = form.getFieldState(fieldName as any);
      return !field.invalid;
    });
    
    if (!isValid) {
      // Trigger validation for current step fields
      form.trigger(currentFields as any);
      return;
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  // Get fields for current step for validation
  const getFieldsForStep = (currentStep: number): string[] => {
    switch (currentStep) {
      case 1:
        return ['listingType', 'propertyType', 'title', 'price'];
      case 2:
        return ['region', 'city', 'district', 'address'];
      case 3:
        return ['description', 'area', 'rooms'];
      case 4:
        return ['photos'];
      default:
        return [];
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          {/* Steps Header */}
          <div className="flex border-b">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div 
                key={index} 
                className={`flex-1 py-4 px-6 text-center cursor-pointer transition-colors border-b-2 ${
                  step === index + 1 
                    ? 'border-primary text-primary' 
                    : step > index + 1 
                      ? 'border-green-500' 
                      : 'border-transparent'
                }`}
                onClick={() => {
                  // Only allow navigating to completed steps or the current step
                  if (index + 1 <= step) {
                    setStep(index + 1);
                  }
                }}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    step === index + 1 
                      ? 'step-active' 
                      : step > index + 1 
                        ? 'step-completed' 
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {step > index + 1 ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    [<Home className="h-5 w-5" />, <MapPin className="h-5 w-5" />, <Home className="h-5 w-5" />, <ImagePlus className="h-5 w-5" />][index]
                  )}
                </div>
                <span className="text-sm font-medium">
                  {["Основна інформація", "Розташування", "Деталі", "Фотографії"][index]}
                </span>
              </div>
            ))}
          </div>

          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <>
                    <h2 className="text-xl font-bold mb-6">Основна інформація про нерухомість</h2>
                    
                    <FormField
                      control={form.control}
                      name="listingType"
                      render={({ field }) => (
                        <FormItem className="mb-6">
                          <FormLabel>Тип оголошення <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sale" id="sale" />
                                <Label htmlFor="sale">Продаж</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="rent" id="rent" />
                                <Label htmlFor="rent">Оренда</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem className="mb-6">
                          <FormLabel>Тип нерухомості <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="apartment" id="apartment" />
                                <Label htmlFor="apartment">Квартира</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="house" id="house" />
                                <Label htmlFor="house">Будинок</Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Назва оголошення <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Напр.: Сучасна квартира з ремонтом в центрі міста" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {listingType === "sale" ? "Ціна (грн) " : "Ціна за місяць (грн) "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <span className="text-gray-500">₴</span>
                              </div>
                              <Input 
                                {...field} 
                                type="number" 
                                placeholder="Вкажіть ціну" 
                                className="pl-7"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {/* Step 2: Location */}
                {step === 2 && (
                  <>
                    <h2 className="text-xl font-bold mb-6">Розташування нерухомості</h2>
                    
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Область <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Напр.: Київська область" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Місто <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Напр.: Київ" />
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
                          <FormLabel>Район <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Напр.: Печерський" />
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
                          <FormLabel>Адреса <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Напр.: вул. Хрещатик, 15" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {/* Step 3: Property Details */}
                {step === 3 && (
                  <>
                    <h2 className="text-xl font-bold mb-6">Деталі та опис нерухомості</h2>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Опис <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Детальний опис вашої нерухомості. Вкажіть особливості, переваги, стан, зручності тощо."
                              rows={5}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Площа (м²) <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                placeholder="Загальна площа в м²"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="rooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Кількість кімнат <span className="text-red-500">*</span></FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(Number(value))}
                              defaultValue={field.value.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Виберіть кількість кімнат" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 кімната</SelectItem>
                                <SelectItem value="2">2 кімнати</SelectItem>
                                <SelectItem value="3">3 кімнати</SelectItem>
                                <SelectItem value="4">4 кімнати</SelectItem>
                                <SelectItem value="5">5+ кімнат</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
                
                {/* Step 4: Photos */}
                {step === 4 && (
                  <>
                    <h2 className="text-xl font-bold mb-6">Додайте фотографії нерухомості</h2>
                    
                    <FormField
                      control={form.control}
                      name="photos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Завантажте фотографії <span className="text-red-500">*</span></FormLabel>
                          <FormControl>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                              <div className="mb-4">
                                <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                              </div>
                              <h4 className="font-bold mb-2">Перетягніть фотографії сюди</h4>
                              <p className="text-gray-600 text-sm mb-4">або</p>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => document.getElementById('photo-upload')?.click()}
                              >
                                Вибрати файли
                              </Button>
                              <input
                                id="photo-upload"
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoUpload}
                              />
                              <p className="text-gray-500 text-xs mt-4">
                                Підтримуються формати: JPG, PNG, WEBP. Максимальний розмір файлу: 10MB.
                              </p>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {photoUrls.length > 0 && (
                      <div>
                        <FormLabel>Завантажені фотографії</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          {photoUrls.map((url, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                                <Button
                                  type="button"
                                  variant="default"
                                  size="icon"
                                  className="w-8 h-8 rounded-full bg-white text-gray-700 hover:text-gray-900"
                                  onClick={() => setMainPhoto(index)}
                                  disabled={index === 0}
                                >
                                  <i className="fas fa-star text-xs" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="default"
                                  size="icon"
                                  className="w-8 h-8 rounded-full bg-white text-red-600 hover:text-red-700"
                                  onClick={() => removePhoto(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              {index === 0 && (
                                <div className="absolute top-2 left-2 bg-primary text-white text-xs py-1 px-2 rounded">
                                  Головне фото
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                      <AlertDescription>
                        Після відправки оголошення воно буде перевірено модератором перед публікацією.
                        Зазвичай це займає не більше 24 годин.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
                
                {/* Navigation Buttons */}
                <div className="pt-4 flex justify-between">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                    >
                      <i className="fas fa-arrow-left mr-2"></i> Назад
                    </Button>
                  )}
                  
                  {step < totalSteps ? (
                    <Button
                      type="button"
                      className="ml-auto"
                      onClick={nextStep}
                    >
                      Далі <i className="fas fa-arrow-right ml-2"></i>
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="ml-auto"
                      disabled={isPending}
                    >
                      {isPending ? 'Відправка...' : 'Опублікувати оголошення'}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
