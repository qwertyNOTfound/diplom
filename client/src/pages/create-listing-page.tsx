import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Home, MapPin, Image, CheckCircle, UploadCloud } from "lucide-react";
import { insertListingSchema, InsertListing } from "@shared/schema";

const STEPS = [
  { id: 1, title: "Основна інформація", icon: Home },
  { id: 2, title: "Розташування", icon: MapPin },
  { id: 3, title: "Фотографії", icon: Image },
  { id: 4, title: "Готово", icon: CheckCircle },
];

export default function CreateListingPage() {
  const [step, setStep] = useState(1);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Initialize form with Zod schema
  const form = useForm<z.infer<typeof insertListingSchema>>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      title: "",
      description: "",
      region: "",
      city: "",
      district: "",
      address: "",
      price: 0,
      area: 0,
      rooms: 0,
      listingType: "sale",
      propertyType: "apartment",
    },
  });

  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (data: InsertListing) => {
      const res = await apiRequest("POST", "/api/listings", data);
      return await res.json();
    },
    onSuccess: (data) => {
      // Upload photos for the created listing
      if (uploadedPhotos.length > 0) {
        uploadedPhotos.forEach((url, index) => {
          apiRequest("POST", "/api/photos", {
            listingId: data.id,
            url,
            isPrimary: index === primaryPhotoIndex,
          });
        });
      }

      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/my-listings"] });
      
      toast({
        title: "Оголошення створено",
        description: "Ваше оголошення було успішно створено і відправлено на модерацію.",
      });
      
      // Navigate to the final step
      setStep(4);
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка створення оголошення",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    if (step < STEPS.length) {
      // Validate current step before proceeding
      let shouldProceed = false;
      
      if (step === 1) {
        form.trigger(["title", "description", "price", "area", "rooms", "listingType", "propertyType"]).then((isValid) => {
          if (isValid) setStep(step + 1);
        });
      } else if (step === 2) {
        form.trigger(["region", "city", "district", "address"]).then((isValid) => {
          if (isValid) setStep(step + 1);
        });
      } else if (step === 3) {
        // For step 3 (photos), we'll allow proceeding even without photos
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFormSubmit = (data: z.infer<typeof insertListingSchema>) => {
    if (step === 3) {
      // Submit the form data
      createListingMutation.mutate(data);
    } else {
      nextStep();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is a mock implementation - in a real app you'd upload these to a server
    const files = e.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      // Create placeholder URLs for demo - in real app, these would be actual uploaded image URLs
      newPhotos.push(`https://images.unsplash.com/photo-1501183638710-841dd1904471?w=800&h=600&auto=format&fit=crop`);
    }

    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
    toast({
      title: "Фотографії завантажено",
      description: `Додано ${files.length} фотографій`,
    });
  };

  const makePhotoPrimary = (index: number) => {
    setPrimaryPhotoIndex(index);
    toast({
      title: "Встановлено головне фото",
      description: "Фотографія встановлена як головна для оголошення",
    });
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
    if (primaryPhotoIndex === index) {
      setPrimaryPhotoIndex(0);
    } else if (primaryPhotoIndex > index) {
      setPrimaryPhotoIndex(primaryPhotoIndex - 1);
    }
    toast({
      title: "Фотографію видалено",
      description: "Фотографія була видалена з оголошення",
    });
  };

  const navigateToMyListings = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <div className="bg-primary py-8 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Розміщення оголошення</h1>
          <p className="mt-2 opacity-90">Заповніть форму для розміщення вашого оголошення</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            {/* Steps */}
            <div className="flex border-b">
              {STEPS.map((s) => (
                <div
                  key={s.id}
                  className={`flex-1 py-4 px-6 text-center cursor-pointer transition-colors border-b-2 ${
                    step === s.id
                      ? "border-primary text-primary"
                      : step > s.id
                      ? "border-green-600"
                      : "border-transparent"
                  }`}
                  onClick={() => {
                    if (step > s.id) setStep(s.id);
                  }}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                      step === s.id
                        ? "step-active"
                        : step > s.id
                        ? "step-completed"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {step > s.id ? <CheckCircle className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                  </div>
                  <span className="text-sm font-medium">{s.title}</span>
                </div>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)}>
                {/* Step 1: Basic Information */}
                {step === 1 && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Основна інформація про нерухомість</h2>

                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="listingType"
                        render={({ field }) => (
                          <FormItem className="space-y-1">
                            <FormLabel>Тип оголошення <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="sale" id="sale" />
                                  <label htmlFor="sale">Продаж</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="rent" id="rent" />
                                  <label htmlFor="rent">Оренда</label>
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
                          <FormItem className="space-y-1">
                            <FormLabel>Тип нерухомості <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex space-x-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="apartment" id="apartment" />
                                  <label htmlFor="apartment">Квартира</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="house" id="house" />
                                  <label htmlFor="house">Будинок</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="commercial" id="commercial" />
                                  <label htmlFor="commercial">Комерційна</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="land" id="land" />
                                  <label htmlFor="land">Земельна ділянка</label>
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
                              <Input
                                placeholder="Напр.: Сучасна квартира з ремонтом в центрі міста"
                                {...field}
                              />
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
                            <FormLabel>Опис <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Детальний опис вашої нерухомості. Вкажіть особливості, переваги, стан, зручності тощо."
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ціна <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span className="text-gray-500">₴</span>
                                  </div>
                                  <Input
                                    type="number"
                                    placeholder="Вкажіть ціну"
                                    className="pl-7"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  />
                                </div>
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
                              <FormLabel>Площа (м²) <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Загальна площа в м²"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="rooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Кількість кімнат <span className="text-red-500">*</span></FormLabel>
                            <Select
                              onValueChange={(value) => field.onChange(parseInt(value))}
                              value={field.value.toString()}
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

                      <div className="pt-4 flex justify-end">
                        <Button type="button" onClick={nextStep}>
                          Далі <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location */}
                {step === 2 && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Розташування нерухомості</h2>

                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Область <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Виберіть область" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Київська область">Київська область</SelectItem>
                                <SelectItem value="Львівська область">Львівська область</SelectItem>
                                <SelectItem value="Одеська область">Одеська область</SelectItem>
                                <SelectItem value="Харківська область">Харківська область</SelectItem>
                                <SelectItem value="Дніпропетровська область">Дніпропетровська область</SelectItem>
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
                            <FormLabel>Місто <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Виберіть місто" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Київ">Київ</SelectItem>
                                <SelectItem value="Львів">Львів</SelectItem>
                                <SelectItem value="Одеса">Одеса</SelectItem>
                                <SelectItem value="Харків">Харків</SelectItem>
                                <SelectItem value="Дніпро">Дніпро</SelectItem>
                              </SelectContent>
                            </Select>
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
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Виберіть район" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Шевченківський">Шевченківський</SelectItem>
                                <SelectItem value="Печерський">Печерський</SelectItem>
                                <SelectItem value="Голосіївський">Голосіївський</SelectItem>
                                <SelectItem value="Дніпровський">Дніпровський</SelectItem>
                                <SelectItem value="Оболонський">Оболонський</SelectItem>
                              </SelectContent>
                            </Select>
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
                              <Input placeholder="Вулиця, номер будинку" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="pt-4 flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                        </Button>
                        <Button type="button" onClick={nextStep}>
                          Далі <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Photos */}
                {step === 3 && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-6">Додайте фотографії нерухомості</h2>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                          Завантажте фотографії <span className="text-red-500">*</span>
                        </label>
                        <p className="text-gray-600 text-sm mb-4">
                          Додайте від 3 до 10 якісних фотографій, щоб привернути увагу потенційних покупців.
                        </p>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                          <div className="mb-4">
                            <UploadCloud className="h-12 w-12 text-gray-400 mx-auto" />
                          </div>
                          <h4 className="font-bold mb-2">Перетягніть фотографії сюди</h4>
                          <p className="text-gray-600 text-sm mb-4">або</p>
                          <Button type="button" variant="outline" className="relative">
                            Вибрати файли
                            <input
                              type="file"
                              multiple
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={handlePhotoUpload}
                              accept="image/*"
                            />
                          </Button>
                          <p className="text-gray-500 text-xs mt-4">
                            Підтримуються формати: JPG, PNG, WEBP. Максимальний розмір файлу: 10MB.
                          </p>
                        </div>
                      </div>

                      {uploadedPhotos.length > 0 && (
                        <div>
                          <label className="block text-gray-700 mb-2 font-medium">
                            Завантажені фотографії
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {uploadedPhotos.map((photo, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={photo}
                                  alt={`Фото ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                                  <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => makePhotoPrimary(index)}
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8 rounded-full"
                                    onClick={() => removePhoto(index)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                                {index === primaryPhotoIndex && (
                                  <div className="absolute top-2 left-2 bg-primary text-white text-xs py-1 px-2 rounded">
                                    Головне фото
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 flex justify-between">
                        <Button type="button" variant="outline" onClick={prevStep}>
                          <ArrowLeft className="mr-2 h-4 w-4" /> Назад
                        </Button>
                        <Button type="submit" disabled={createListingMutation.isPending}>
                          {createListingMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Створення...
                            </>
                          ) : (
                            <>
                              Опублікувати оголошення
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review & Submit - Success message */}
                {step === 4 && (
                  <div className="p-6">
                    <div className="text-center mb-8">
                      <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-10 w-10" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Ваше оголошення відправлено на модерацію</h2>
                      <p className="text-gray-600">
                        Дякуємо за розміщення оголошення на нашій платформі. Воно буде опубліковане після перевірки модератором.
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="font-bold mb-4">Наступні кроки</h3>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                            1
                          </div>
                          <span>Модератори перевірять вказану інформацію про нерухомість</span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                            2
                          </div>
                          <span>Ви отримаєте повідомлення про статус вашого оголошення</span>
                        </li>
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 h-5 w-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                            3
                          </div>
                          <span>Після схвалення, оголошення стане доступним для всіх користувачів</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-center">
                      <Button onClick={navigateToMyListings}>
                        Перейти до Моїх оголошень
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </>
  );
}

// Add icons that were imported but not defined
function ArrowRight(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
}

function ArrowLeft(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
}

function Star(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}

function Trash(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
}
