import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Phone, Mail, Facebook, Instagram } from "lucide-react";

// Contact form schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Ім'я має містити не менше 2 символів"),
  email: z.string().email("Введіть коректний email"),
  subject: z.string().min(1, "Оберіть тему повідомлення"),
  message: z.string().min(10, "Повідомлення має містити не менше 10 символів"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const ContactPage = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    // Mock API call
    setTimeout(() => {
      console.log("Contact form data:", data);
      toast({
        title: "Повідомлення надіслано",
        description: "Дякуємо за ваше звернення. Ми зв'яжемося з вами найближчим часом.",
      });
      form.reset();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-primary py-8 -mx-4 px-4 mb-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white">Контакти</h1>
          <p className="mt-2 text-white/90">
            Зв'яжіться з нами, якщо у вас є питання або пропозиції
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        <Card className="mb-12">
          <CardContent className="p-0">
            <div className="md:flex">
              <div className="md:w-1/2 p-8">
                <h2 className="text-2xl font-bold mb-6">Напишіть нам</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ваше ім'я</FormLabel>
                          <FormControl>
                            <Input placeholder="Введіть ваше ім'я" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Електронна пошта</FormLabel>
                          <FormControl>
                            <Input placeholder="Введіть вашу електронну пошту" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Тема</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Оберіть тему звернення" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">Загальне питання</SelectItem>
                              <SelectItem value="technical">Технічна підтримка</SelectItem>
                              <SelectItem value="cooperation">Співпраця</SelectItem>
                              <SelectItem value="complaint">Скарга на оголошення</SelectItem>
                              <SelectItem value="other">Інше</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Повідомлення</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Введіть ваше повідомлення"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Надсилання..." : "Надіслати повідомлення"}
                    </Button>
                  </form>
                </Form>
              </div>

              <div className="md:w-1/2 bg-gray-50 p-8">
                <h2 className="text-2xl font-bold mb-6">Контактна інформація</h2>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mt-1 mr-4 text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Адреса</h3>
                      <p className="text-gray-700">м. Київ, вул. Хрещатик 10, офіс 205</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mt-1 mr-4 text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Телефон</h3>
                      <p className="text-gray-700">+380 44 123 4567</p>
                      <p className="text-gray-700">+380 67 123 4567 (Viber, Telegram)</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mt-1 mr-4 text-primary" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Електронна пошта</h3>
                      <p className="text-gray-700">info@homedirect.ua</p>
                      <p className="text-gray-700">support@homedirect.ua</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <svg className="h-5 w-5 mt-1 mr-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h3 className="font-semibold text-gray-900">Графік роботи</h3>
                      <p className="text-gray-700">Пн-Пт: 9:00 - 18:00</p>
                      <p className="text-gray-700">Сб-Нд: Онлайн підтримка</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Соціальні мережі</h3>
                    <div className="flex space-x-4">
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors"
                      >
                        <Facebook className="h-5 w-5" />
                      </a>
                      <a
                        href="#"
                        className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="bg-gray-200 rounded-lg h-96 w-full">
              {/* Map placeholder */}
              <div className="h-full w-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MapPin className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>Інтерактивна карта</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactPage;
