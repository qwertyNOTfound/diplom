import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

import { Home, Plus, Eye, Edit, Trash2, DoorOpen, Ruler, Calendar, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import PropertyGrid from "@/components/listings/PropertyGrid";

export default function UserDashboard() {
  const [, navigate] = useLocation();
  const { user, verifyEmailMutation, requestVerificationMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listings");
  const [deletePropertyId, setDeletePropertyId] = useState<number | null>(null);
  const [verificationCode, setVerificationCode] = useState("");

  // Fetch user's properties
  const { 
    data: userProperties,
    isLoading: isPropertiesLoading,
    refetch: refetchProperties
  } = useQuery({
    queryKey: ["/api/user/properties"],
    queryFn: async () => {
      const res = await fetch("/api/user/properties");
      if (!res.ok) throw new Error("Failed to fetch user properties");
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch user's favorite properties
  const {
    data: favoriteProperties,
    isLoading: isFavoritesLoading
  } = useQuery({
    queryKey: ["/api/favorites"],
    queryFn: async () => {
      const res = await fetch("/api/favorites");
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return res.json();
    },
    enabled: !!user,
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      await apiRequest("DELETE", `/api/properties/${propertyId}`);
    },
    onSuccess: () => {
      toast({
        title: "Оголошення видалено",
        description: "Ваше оголошення було успішно видалено.",
      });
      refetchProperties();
      setDeletePropertyId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    },
    onError: (error) => {
      toast({
        title: "Помилка",
        description: `Не вдалося видалити оголошення: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle delete confirmation
  const confirmDelete = () => {
    if (deletePropertyId) {
      deletePropertyMutation.mutate(deletePropertyId);
    }
  };

  // Handle verification code submission
  const handleVerifyEmail = () => {
    if (!user) return;
    
    verifyEmailMutation.mutate(
      {
        email: user.email,
        code: verificationCode,
      },
      {
        onSuccess: () => {
          toast({
            title: "Email підтверджено",
            description: "Ваша електронна пошта успішно підтверджена.",
          });
        },
      }
    );
  };

  // Request new verification code
  const handleRequestVerification = () => {
    if (!user) return;
    
    requestVerificationMutation.mutate(
      { email: user.email },
      {
        onSuccess: () => {
          toast({
            title: "Код надіслано",
            description: "Новий код підтвердження надіслано на вашу електронну пошту.",
          });
        },
      }
    );
  };

  // Format date for display
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA");
  };

  // Get status badge color
  const getStatusBadge = (property: Property) => {
    if (property.approved) {
      return <Badge className="bg-green-500">Активне</Badge>;
    }
    return <Badge variant="outline" className="text-amber-500 border-amber-500">На перевірці</Badge>;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-10">
                <h2 className="text-2xl font-bold mb-4">Потрібна авторизація</h2>
                <p className="text-gray-600 mb-6">
                  Для доступу до особистого кабінету потрібно увійти в систему.
                </p>
                <Button onClick={() => navigate("/auth")}>
                  Увійти або зареєструватися
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <Card className="sticky top-24">
            <CardHeader>
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mr-4">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {user.firstName} {user.lastName}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {user.email}
                    {!user.isVerified && (
                      <Badge variant="outline" className="ml-2 text-amber-500 border-amber-500">
                        Не підтверджено
                      </Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <nav className="space-y-1">
                <Button
                  variant={activeTab === "listings" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("listings")}
                >
                  <Home className="mr-3 h-4 w-4" />
                  <span>Мої оголошення</span>
                </Button>
                
                <Button
                  variant={activeTab === "favorites" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("favorites")}
                >
                  <i className="fas fa-heart mr-3 w-5 text-center"></i>
                  <span>Збережені</span>
                </Button>
                
                <Button
                  variant={activeTab === "profile" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  <i className="fas fa-user-cog mr-3 w-5 text-center"></i>
                  <span>Налаштування профілю</span>
                </Button>
              </nav>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => navigate("/create-listing")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Додати оголошення
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="lg:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* My Listings Tab */}
            <TabsContent value="listings">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Мої оголошення</CardTitle>
                    <CardDescription>Керуйте своїми оголошеннями про нерухомість</CardDescription>
                  </div>
                  <Button 
                    className="bg-amber-500 hover:bg-amber-600"
                    onClick={() => navigate("/create-listing")}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Додати оголошення
                  </Button>
                </CardHeader>
                
                <CardContent>
                  {isPropertiesLoading ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex space-x-4">
                              <Skeleton className="h-16 w-16 rounded-md" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-24" />
                              </div>
                            </div>
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : userProperties && userProperties.length > 0 ? (
                    <div className="space-y-4">
                      {userProperties.map((property: Property) => (
                        <div key={property.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex justify-between flex-col md:flex-row gap-4">
                            <div className="flex space-x-4">
                              <img 
                                src={property.photos[0]} 
                                alt={property.title}
                                className="h-16 w-16 object-cover rounded-md"
                              />
                              <div>
                                <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                                <p className="text-sm text-gray-500">{property.city}, {property.district}</p>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                  <div className="flex items-center">
                                    <DoorOpen className="h-4 w-4 mr-1 text-gray-400" />
                                    <span>{property.rooms} кімн.</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Ruler className="h-4 w-4 mr-1 text-gray-400" />
                                    <span>{property.area} м²</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                    <span>{formatDate(property.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col md:items-end space-y-2">
                              <div>
                                {getStatusBadge(property)}
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-blue-600"
                                  onClick={() => navigate(`/properties/${property.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-amber-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => setDeletePropertyId(property.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">У вас ще немає оголошень</h3>
                      <p className="text-gray-500 mb-6">Створіть ваше перше оголошення про нерухомість</p>
                      <Button 
                        onClick={() => navigate("/create-listing")}
                        className="bg-amber-500 hover:bg-amber-600"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Додати оголошення
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Збережені оголошення</CardTitle>
                  <CardDescription>Оголошення, які ви додали до обраного</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <PropertyGrid 
                    properties={favoriteProperties || []}
                    isLoading={isFavoritesLoading}
                    emptyMessage="У вас ще немає збережених оголошень"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Profile Settings Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Налаштування профілю</CardTitle>
                  <CardDescription>Керуйте вашими особистими даними та налаштуваннями</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Email Verification Section */}
                  {!user.isVerified && (
                    <Card className="border-amber-200 bg-amber-50">
                      <CardHeader>
                        <CardTitle className="text-lg">Підтвердження Email</CardTitle>
                        <CardDescription>
                          Для розміщення оголошень необхідно підтвердити вашу електронну пошту
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-4">
                            Ми надіслали код підтвердження на адресу <strong>{user.email}</strong>.
                            Введіть його нижче, щоб підтвердити вашу електронну пошту.
                          </p>
                          
                          <div className="flex flex-col md:flex-row gap-4">
                            <Input
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              placeholder="Введіть 6-значний код"
                              maxLength={6}
                              className="md:w-64"
                            />
                            <Button 
                              onClick={handleVerifyEmail}
                              disabled={verificationCode.length !== 6 || verifyEmailMutation.isPending}
                            >
                              {verifyEmailMutation.isPending ? "Перевірка..." : "Підтвердити Email"}
                            </Button>
                          </div>
                          
                          <div className="mt-3">
                            <Button 
                              variant="link" 
                              className="p-0 h-auto text-sm"
                              onClick={handleRequestVerification}
                              disabled={requestVerificationMutation.isPending}
                            >
                              {requestVerificationMutation.isPending
                                ? "Надсилання..."
                                : "Надіслати код повторно"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Basic Profile Info */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Основна інформація</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel>Ім'я</FormLabel>
                        <Input value={user.firstName} disabled />
                      </div>
                      
                      <div>
                        <FormLabel>Прізвище</FormLabel>
                        <Input value={user.lastName} disabled />
                      </div>
                      
                      <div>
                        <FormLabel>По батькові</FormLabel>
                        <Input value={user.middleName || ""} disabled />
                      </div>
                      
                      <div>
                        <FormLabel>Email</FormLabel>
                        <div className="flex items-center gap-2">
                          <Input value={user.email} disabled />
                          {user.isVerified && (
                            <Badge className="bg-green-500 whitespace-nowrap">
                              Підтверджено
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <FormLabel>Логін</FormLabel>
                        <Input value={user.username} disabled />
                      </div>
                      
                      <div>
                        <FormLabel>Телефон</FormLabel>
                        <Input value={user.phoneNumber || ""} disabled />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-gray-500">
                        Для зміни особистих даних, будь ласка, зв'яжіться з підтримкою.
                      </p>
                    </div>
                  </div>
                  
                  {/* Account Activity Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Активність облікового запису</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">
                            Дата реєстрації: <span className="font-medium">{formatDate(user.createdAt)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Security Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Безпека</h3>
                    
                    <Button variant="outline">
                      Змінити пароль
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Delete Property Confirmation Dialog */}
      <AlertDialog open={!!deletePropertyId} onOpenChange={() => setDeletePropertyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ви впевнені?</AlertDialogTitle>
            <AlertDialogDescription>
              Ця дія видалить ваше оголошення назавжди. Це незворотна дія.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending ? "Видалення..." : "Видалити"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
