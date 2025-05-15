import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VerificationInput } from '@/components/ui/verification-input';
import { InsertUser, insertUserSchema } from '@shared/schema';

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Ім'я користувача обов'язкове"),
  password: z.string().min(1, "Пароль обов'язковий"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Registration form schema
const registrationSchema = insertUserSchema.extend({
  password: z.string().min(6, "Пароль повинен містити щонайменше 6 символів"),
  confirmPassword: z.string().min(1, "Підтвердження паролю обов'язкове"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Паролі не співпадають",
  path: ["confirmPassword"],
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

// Admin login schema
const adminLoginSchema = z.object({
  username: z.string().min(1, "Ім'я користувача обов'язкове"),
  password: z.string().min(1, "Пароль обов'язковий"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

// Verification schema
const verificationSchema = z.object({
  email: z.string().email("Введіть дійсну електронну адресу"),
  code: z.string().length(6, "Код підтвердження має містити 6 цифр"),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, adminLoginMutation, registerMutation, verifyEmailMutation, requestVerificationMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [adminMode, setAdminMode] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Admin login form
  const adminLoginForm = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Registration form
  const registrationForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      middleName: '',
      phoneNumber: '',
      isVerified: false,
    },
  });

  // Verification form
  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      email: '',
      code: '',
    },
  });

  // Form submission handlers
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onAdminLoginSubmit = (data: AdminLoginFormValues) => {
    adminLoginMutation.mutate(data);
  };

  const onRegistrationSubmit = (data: RegistrationFormValues) => {
    const userData: InsertUser = {
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName || '',
      phoneNumber: data.phoneNumber || '',
      isVerified: false,
    };
    
    registerMutation.mutate(userData, {
      onSuccess: () => {
        setVerificationEmail(data.email);
        setShowVerification(true);
      }
    });
  };

  const onVerificationSubmit = (data: VerificationFormValues) => {
    verifyEmailMutation.mutate(data, {
      onSuccess: () => {
        setShowVerification(false);
        navigate('/dashboard');
      }
    });
  };

  const resendVerificationCode = () => {
    if (verificationEmail) {
      requestVerificationMutation.mutate({ email: verificationEmail });
    }
  };

  if (user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-10 min-h-screen flex items-center justify-center">
      {showVerification ? (
        // Verification screen
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Перевірка email</CardTitle>
            <CardDescription className="text-center">
              Ми надіслали код підтвердження на вашу електронну пошту.
              Будь ласка, введіть його нижче.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...verificationForm}>
              <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-6">
                <FormField
                  control={verificationForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} value={verificationEmail} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={verificationForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Код підтвердження</FormLabel>
                      <FormControl>
                        <VerificationInput 
                          length={6} 
                          onChange={(code) => field.onChange(code)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col space-y-3">
                  <Button 
                    type="submit" 
                    disabled={verifyEmailMutation.isPending}
                    className="w-full"
                  >
                    {verifyEmailMutation.isPending ? "Перевірка..." : "Підтвердити"}
                  </Button>
                  
                  <div className="text-center text-sm">
                    <span className="text-gray-600">Не отримали код? </span>
                    <Button 
                      variant="link" 
                      onClick={resendVerificationCode}
                      disabled={requestVerificationMutation.isPending}
                      className="p-0 h-auto"
                    >
                      {requestVerificationMutation.isPending ? "Надсилання..." : "Надіслати повторно"}
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowVerification(false)}
                    className="w-full"
                  >
                    Повернутися до входу
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : adminMode ? (
        // Admin login
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Вхід для адміністратора</CardTitle>
            <CardDescription className="text-center">
              Введіть ваші облікові дані для доступу до адмін-панелі
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...adminLoginForm}>
              <form onSubmit={adminLoginForm.handleSubmit(onAdminLoginSubmit)} className="space-y-6">
                <FormField
                  control={adminLoginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Логін</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="admin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={adminLoginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пароль</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="••••••••" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col space-y-3">
                  <Button 
                    type="submit" 
                    disabled={adminLoginMutation.isPending}
                    className="w-full"
                  >
                    {adminLoginMutation.isPending ? "Вхід..." : "Увійти"}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => setAdminMode(false)}
                    className="w-full"
                  >
                    Повернутися до звичайного входу
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        // Regular login/register
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Вхід</TabsTrigger>
                <TabsTrigger value="register">Реєстрація</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Вхід в обліковий запис</CardTitle>
                    <CardDescription>
                      Введіть ваші облікові дані для доступу до платформи.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Логін або email</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="your_username" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Пароль</FormLabel>
                              <FormControl>
                                <Input {...field} type="password" placeholder="••••••••" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          disabled={loginMutation.isPending}
                          className="w-full"
                        >
                          {loginMutation.isPending ? "Вхід..." : "Увійти"}
                        </Button>
                      </form>
                    </Form>
                    
                    <div className="mt-6 text-center">
                      <Button 
                        variant="link" 
                        onClick={() => setAdminMode(true)}
                        className="text-gray-500 text-sm"
                      >
                        Вхід для адміністраторів
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Створення облікового запису</CardTitle>
                    <CardDescription>
                      Зареєструйтеся, щоб розміщувати оголошення або зберігати вподобані.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...registrationForm}>
                      <form onSubmit={registrationForm.handleSubmit(onRegistrationSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={registrationForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ім'я <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Іван" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registrationForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Прізвище <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Петренко" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={registrationForm.control}
                          name="middleName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>По батькові</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Олександрович" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registrationForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Логін <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="your_username" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registrationForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="your@email.com" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registrationForm.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Телефон</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+380671234567" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={registrationForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Пароль <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" placeholder="••••••••" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registrationForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Підтвердження паролю <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                  <Input {...field} type="password" placeholder="••••••••" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                          <AlertDescription className="text-sm">
                            Після реєстрації вам потрібно буде підтвердити вашу електронну пошту.
                          </AlertDescription>
                        </Alert>
                        
                        <Button 
                          type="submit" 
                          disabled={registerMutation.isPending}
                          className="w-full"
                        >
                          {registerMutation.isPending ? "Реєстрація..." : "Зареєструватися"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="hidden md:flex flex-col justify-center">
            <div className="bg-gradient-to-r from-primary to-blue-700 text-white rounded-xl p-10 h-full flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">ВласнаОселя</h2>
              <p className="text-lg mb-6">
                Платформа для пошуку та розміщення оголошень про нерухомість без посередників
              </p>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <span className="mr-2 text-xl">✓</span>
                  <span>Розміщуйте оголошення безкоштовно</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-xl">✓</span>
                  <span>Спілкуйтесь напряму з власниками</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-xl">✓</span>
                  <span>Знаходьте потрібну нерухомість швидко</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-xl">✓</span>
                  <span>Економте на комісіях ріелторів</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
