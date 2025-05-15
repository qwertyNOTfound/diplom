import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Loader2, Home, User, Plus, Pencil, Trash2, Clock, Activity, Eye, CreditCard } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ListingWithPhotos } from "@shared/schema";
import { VerifiedBadge } from "@/components/ui/verified-badge";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("listings");
  
  // Fetch user listings
  const { data: userListings, isLoading } = useQuery<ListingWithPhotos[]>({
    queryKey: ["/api/my-listings"],
    enabled: !!user,
  });
  
  // Delete listing mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-listings"] });
    },
  });
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Помилка доступу</h2>
        <p className="mb-6">Будь ласка, увійдіть в систему для доступу до особистого кабінету</p>
        <Link href="/auth">
          <Button>Увійти</Button>
        </Link>
      </div>
    );
  }
  
  // Format status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Активне</Badge>;
      case 'pending':
        return <Badge variant="warning">На перевірці</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Відхилено</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: uk });
  };
  
  return (
    <>
      <div className="bg-primary py-8 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Мій кабінет</h1>
          <p className="mt-2 opacity-90">Керуйте своїми оголошеннями та налаштуваннями</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-24">
              <CardContent className="p-6 border-b">
                <div className="flex items-center">
                  <div className="w-14 h-14 rounded-full bg-primary-100 text-primary flex items-center justify-center text-xl font-bold mr-4">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <h3 className="font-bold text-lg">{user.firstName} {user.lastName}</h3>
                      <VerifiedBadge verified={user.isEmailVerified} />
                    </div>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
              </CardContent>
              
              <div className="p-4">
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
                    variant={activeTab === "profile" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="mr-3 h-4 w-4" />
                    <span>Профіль</span>
                  </Button>
                  
                  <Link href="/create-listing">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Plus className="mr-3 h-4 w-4" />
                      <span>Додати оголошення</span>
                    </Button>
                  </Link>
                </nav>
              </div>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:w-3/4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="listings">Мої оголошення</TabsTrigger>
                <TabsTrigger value="profile">Профіль</TabsTrigger>
              </TabsList>
              
              {/* Listings Tab */}
              <TabsContent value="listings">
                <Card>
                  <CardContent className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">Мої оголошення</h2>
                    <Link href="/create-listing">
                      <Button variant="secondary">
                        <Plus className="mr-2 h-4 w-4" /> Додати оголошення
                      </Button>
                    </Link>
                  </CardContent>
                  
                  {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : userListings && userListings.length > 0 ? (
                    <ScrollArea className="h-[600px] w-full">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Нерухомість</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ціна</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Дії</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {userListings.map((listing) => (
                            <tr key={listing.id}>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 flex-shrink-0 mr-3">
                                    <img 
                                      src={listing.photos && listing.photos.length > 0 
                                        ? listing.photos[0].url 
                                        : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'} 
                                      className="h-10 w-10 rounded-md object-cover" 
                                      alt={listing.title}
                                    />
                                  </div>
                                  <div className="max-w-xs">
                                    <div className="font-medium text-gray-900 truncate">{listing.title}</div>
                                    <div className="text-gray-500 text-sm truncate">{`${listing.city}, ${listing.district}`}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-gray-900 font-medium">
                                  {listing.listingType === 'sale' 
                                    ? `${listing.price.toLocaleString()} грн` 
                                    : `${listing.price.toLocaleString()} грн/міс`}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {listing.listingType === 'sale' ? 'Продаж' : 'Оренда'}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {getStatusBadge(listing.status)}
                              </td>
                              <td className="px-6 py-4 text-gray-500 text-sm">
                                {formatDate(listing.createdAt.toString())}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end space-x-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Link href={`/property/${listing.id}`}>
                                          <Button size="icon" variant="ghost">
                                            <Eye className="h-4 w-4 text-blue-600" />
                                          </Button>
                                        </Link>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Переглянути</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                          <Pencil className="h-4 w-4 text-amber-600" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Редагувати</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                  
                                  <AlertDialog>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <AlertDialogTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                              <Trash2 className="h-4 w-4 text-red-600" />
                                            </Button>
                                          </AlertDialogTrigger>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Видалити</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Видалити оголошення?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Ви впевнені, що хочете видалити це оголошення? Цю дію неможливо скасувати.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Скасувати</AlertDialogCancel>
                                        <AlertDialogAction 
                                          className="bg-red-600 hover:bg-red-700"
                                          onClick={() => deleteMutation.mutate(listing.id)}
                                        >
                                          Видалити
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-10">
                      <div className="mx-auto w-20 h-20 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                        <Home className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">У вас ще немає оголошень</h3>
                      <p className="text-gray-600 mb-6">Створіть своє перше оголошення, щоб знайти покупців чи орендарів</p>
                      <Link href="/create-listing">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" /> Додати оголошення
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
                
                <Card className="mt-8">
                  <CardContent className="p-6 border-b">
                    <h2 className="text-xl font-bold">Статистика активності</h2>
                  </CardContent>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Активних оголошень</p>
                            <p className="text-2xl font-bold text-primary">
                              {userListings ? userListings.filter(l => l.status === 'approved').length : 0}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                            <Home className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Переглядів</p>
                            <p className="text-2xl font-bold text-primary">0</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                            <Eye className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">На перевірці</p>
                            <p className="text-2xl font-bold text-primary">
                              {userListings ? userListings.filter(l => l.status === 'pending').length : 0}
                            </p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                            <Clock className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-bold mb-3">Остання активність</h3>
                      
                      <div className="space-y-3">
                        {userListings && userListings.length > 0 ? (
                          userListings.slice(0, 3).map((listing) => (
                            <div key={`activity-${listing.id}`} className="flex items-start">
                              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                                <Activity className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-gray-800">
                                  Оголошення "{listing.title}" {
                                    listing.status === 'approved' ? 'активне' :
                                    listing.status === 'pending' ? 'на перевірці' : 'відхилено'
                                  }
                                </p>
                                <p className="text-gray-500 text-sm">
                                  {formatDate(listing.createdAt.toString())}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">Немає недавньої активності</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardContent className="p-6 border-b">
                    <h2 className="text-xl font-bold">Особисті дані</h2>
                  </CardContent>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Ім'я</h3>
                        <p className="text-lg">{user.firstName}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Прізвище</h3>
                        <p className="text-lg">{user.lastName}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">По батькові</h3>
                        <p className="text-lg">{user.middleName || "—"}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Телефон</h3>
                        <p className="text-lg">{user.phone}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-lg">{user.email}</p>
                          <VerifiedBadge verified={user.isEmailVerified} />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Ім'я користувача</h3>
                        <p className="text-lg">{user.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button>
                        Редагувати профіль
                      </Button>
                      <Button variant="outline">
                        Змінити пароль
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}

// Add Badge component variant definitions
const badgeVariants = {
  "default": "bg-gray-100 text-gray-800",
  "success": "bg-green-100 text-green-800",
  "warning": "bg-amber-100 text-amber-800",
  "destructive": "bg-red-100 text-red-800",
};
