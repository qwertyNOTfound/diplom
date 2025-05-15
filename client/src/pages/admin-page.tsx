import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ListingWithPhotos } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Shield, CheckCircle, X, Eye, ChevronLeft, ChevronRight, BarChart3, Users, ClipboardList, Ban, Cog } from "lucide-react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";

export default function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState("pending");
  const [selectedListing, setSelectedListing] = useState<ListingWithPhotos | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Fetch pending listings
  const { data: pendingListings, isLoading } = useQuery<ListingWithPhotos[]>({
    queryKey: ["/api/admin/pending-listings"],
    enabled: !!user?.isAdmin,
  });

  // Approve/reject mutations
  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/admin/listings/${id}/status`, { status: "approved" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-listings"] });
      toast({
        title: "Оголошення схвалено",
        description: "Оголошення успішно опубліковано на сайті.",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("PUT", `/api/admin/listings/${id}/status`, { status: "rejected" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-listings"] });
      toast({
        title: "Оголошення відхилено",
        description: "Оголошення було відхилено і не буде опубліковано на сайті.",
      });
    },
  });

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: uk });
  };

  // Redirect if not admin
  if (user && !user.isAdmin) {
    navigate("/");
    return null;
  }

  // While checking user state
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate pagination
  const totalPages = pendingListings 
    ? Math.ceil(pendingListings.length / pageSize) 
    : 0;
  
  const paginatedListings = pendingListings 
    ? pendingListings.slice((page - 1) * pageSize, page * pageSize) 
    : [];

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleApprove = (id: number) => {
    approveMutation.mutate(id);
    setSelectedListing(null);
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate(id);
    setSelectedListing(null);
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      <div className="bg-primary py-8 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Адмін-панель</h1>
          <p className="mt-2 opacity-90">Керуйте оголошеннями та користувачами платформи</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-primary mr-2" />
              <h2 className="text-xl font-bold">Ласкаво просимо, адміністратор</h2>
            </div>
            <p className="text-slate-600 mt-2">
              Тут ви можете керувати оголошеннями та користувачами на платформі.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div>
            <Card>
              <CardContent className="p-4">
                <nav>
                  <ul className="space-y-2">
                    <li>
                      <Button
                        variant={activeSection === "pending" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveSection("pending")}
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        <span>Очікують схвалення</span>
                        {pendingListings && pendingListings.length > 0 && (
                          <span className="ml-auto bg-primary/20 text-primary text-xs rounded-full px-2 py-1">
                            {pendingListings.length}
                          </span>
                        )}
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeSection === "approved" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveSection("approved")}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        <span>Схвалені оголошення</span>
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeSection === "rejected" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveSection("rejected")}
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        <span>Відхилені оголошення</span>
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeSection === "users" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveSection("users")}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        <span>Користувачі</span>
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeSection === "statistics" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveSection("statistics")}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Статистика</span>
                      </Button>
                    </li>
                    <li>
                      <Button
                        variant={activeSection === "settings" ? "default" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setActiveSection("settings")}
                      >
                        <Cog className="mr-2 h-4 w-4" />
                        <span>Налаштування</span>
                      </Button>
                    </li>
                  </ul>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeSection} onValueChange={setActiveSection}>
              <TabsList className="hidden">
                <TabsTrigger value="pending">Очікують схвалення</TabsTrigger>
                <TabsTrigger value="approved">Схвалені оголошення</TabsTrigger>
                <TabsTrigger value="rejected">Відхилені оголошення</TabsTrigger>
                <TabsTrigger value="users">Користувачі</TabsTrigger>
                <TabsTrigger value="statistics">Статистика</TabsTrigger>
                <TabsTrigger value="settings">Налаштування</TabsTrigger>
              </TabsList>

              {/* Pending Listings Tab */}
              <TabsContent value="pending">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-sans text-xl font-bold text-secondary mb-4">
                      Оголошення, що очікують схвалення
                    </h3>

                    {isLoading ? (
                      <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : pendingListings && pendingListings.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">ID</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Нерухомість</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Власник</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Дата</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-500">Дії</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedListings.map((listing) => (
                              <tr key={listing.id} className="border-b border-slate-200 hover:bg-slate-50">
                                <td className="px-4 py-4 text-sm text-slate-700">#{listing.id}</td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center">
                                    <img
                                      src={listing.photos && listing.photos.length > 0
                                        ? listing.photos[0].url
                                        : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'}
                                      alt="Мініатюра нерухомості"
                                      className="w-10 h-10 rounded-md object-cover mr-3"
                                    />
                                    <div>
                                      <div className="font-medium text-slate-800">
                                        {listing.propertyType === 'apartment' 
                                          ? `${listing.rooms}-кімн. квартира` 
                                          : listing.propertyType === 'house' 
                                            ? 'Будинок' 
                                            : listing.propertyType}, {listing.area} м²
                                      </div>
                                      <div className="text-sm text-slate-500">
                                        {listing.city}, {listing.district}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-700">
                                  User #{listing.userId}
                                </td>
                                <td className="px-4 py-4 text-sm text-slate-700">
                                  {formatDate(listing.createdAt.toString())}
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex space-x-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button size="sm" variant="outline" onClick={() => setSelectedListing(listing)}>
                                            <Eye className="h-4 w-4 mr-1" /> Деталі
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Переглянути деталі оголошення</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100"
                                            onClick={() => handleApprove(listing.id)}
                                          >
                                            <CheckCircle className="h-4 w-4 mr-1" /> Схвалити
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Схвалити оголошення</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>

                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          className="text-red-700 border-red-200 bg-red-50 hover:bg-red-100"
                                        >
                                          <X className="h-4 w-4 mr-1" /> Відхилити
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Відхилити оголошення?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Ви впевнені, що хочете відхилити це оголошення? Воно не буде опубліковано на сайті.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Скасувати</AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() => handleReject(listing.id)}
                                          >
                                            Відхилити
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

                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="mt-6 flex justify-between items-center">
                            <div className="text-sm text-slate-600">
                              Показано {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, pendingListings.length)} з {pendingListings.length} оголошень
                            </div>

                            <div className="flex items-center space-x-1">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>

                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <Button
                                  key={pageNum}
                                  variant={pageNum === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                >
                                  {pageNum}
                                </Button>
                              ))}

                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <div className="mx-auto w-20 h-20 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                          <ClipboardList className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Немає оголошень на перевірці</h3>
                        <p className="text-gray-600">
                          Усі оголошення перевірені. Перевірте пізніше, коли користувачі додадуть нові оголошення.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Listing Details Modal */}
                {selectedListing && (
                  <AlertDialog defaultOpen={true} onOpenChange={(open) => !open && setSelectedListing(null)}>
                    <AlertDialogContent className="max-w-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Деталі оголошення #{selectedListing.id}</AlertDialogTitle>
                      </AlertDialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                        <div>
                          <div className="h-48 w-full rounded-md overflow-hidden mb-4">
                            <img
                              src={selectedListing.photos && selectedListing.photos.length > 0
                                ? selectedListing.photos[0].url
                                : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600'}
                              alt={selectedListing.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex overflow-x-auto space-x-2 mb-4">
                            {selectedListing.photos && selectedListing.photos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo.url}
                                alt={`Фото ${index + 1}`}
                                className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-2">{selectedListing.title}</h3>
                          <p className="text-gray-600 mb-4">{selectedListing.description}</p>
                          
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Тип оголошення</p>
                              <p className="font-medium">{selectedListing.listingType === 'sale' ? 'Продаж' : 'Оренда'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Тип нерухомості</p>
                              <p className="font-medium">
                                {selectedListing.propertyType === 'apartment' ? 'Квартира' : 
                                 selectedListing.propertyType === 'house' ? 'Будинок' :
                                 selectedListing.propertyType === 'commercial' ? 'Комерційна' : 'Земельна ділянка'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Ціна</p>
                              <p className="font-medium">
                                {selectedListing.listingType === 'sale'
                                  ? `${selectedListing.price.toLocaleString()} грн`
                                  : `${selectedListing.price.toLocaleString()} грн/міс`}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Площа</p>
                              <p className="font-medium">{selectedListing.area} м²</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Кімнати</p>
                              <p className="font-medium">{selectedListing.rooms}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Локація</p>
                              <p className="font-medium">{selectedListing.city}, {selectedListing.district}</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500">Повна адреса</p>
                          <p className="text-gray-700 mb-4">
                            {selectedListing.region}, {selectedListing.city}, {selectedListing.district}, {selectedListing.address}
                          </p>
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Закрити</AlertDialogCancel>
                        <Button 
                          variant="outline" 
                          className="text-green-700 border-green-200 bg-green-50 hover:bg-green-100"
                          onClick={() => handleApprove(selectedListing.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Схвалити
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-red-700 border-red-200 bg-red-50 hover:bg-red-100"
                          onClick={() => handleReject(selectedListing.id)}
                        >
                          <X className="h-4 w-4 mr-1" /> Відхилити
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </TabsContent>

              {/* Other tabs - implement as needed */}
              <TabsContent value="approved">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-sans text-xl font-bold text-secondary mb-4">
                      Схвалені оголошення
                    </h3>
                    <div className="text-center py-10">
                      <div className="mx-auto w-20 h-20 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                        <CheckCircle className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Розділ у розробці</h3>
                      <p className="text-gray-600">
                        Ця функціональність буде доступна найближчим часом.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rejected">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-sans text-xl font-bold text-secondary mb-4">
                      Відхилені оголошення
                    </h3>
                    <div className="text-center py-10">
                      <div className="mx-auto w-20 h-20 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                        <Ban className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Розділ у розробці</h3>
                      <p className="text-gray-600">
                        Ця функціональність буде доступна найближчим часом.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-sans text-xl font-bold text-secondary mb-4">
                      Користувачі
                    </h3>
                    <div className="text-center py-10">
                      <div className="mx-auto w-20 h-20 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                        <Users className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Розділ у розробці</h3>
                      <p className="text-gray-600">
                        Ця функціональність буде доступна найближчим часом.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="statistics">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-sans text-xl font-bold text-secondary mb-4">
                      Статистика платформи
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600">Активні оголошення</p>
                            <p className="text-2xl font-bold text-primary">247</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                            <Home className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600">Зареєстровані користувачі</p>
                            <p className="text-2xl font-bold text-green-600">1,256</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Users className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-amber-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600">Перегляди за сьогодні</p>
                            <p className="text-2xl font-bold text-amber-600">3,421</p>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                            <Eye className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-4">
                      <h4 className="font-medium text-slate-800 mb-4">Нові оголошення (останні 7 днів)</h4>
                      <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                        <p className="text-slate-500">Графік статистики оголошень</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-sans text-xl font-bold text-secondary mb-4">
                      Налаштування
                    </h3>
                    <div className="text-center py-10">
                      <div className="mx-auto w-20 h-20 bg-gray-100 flex items-center justify-center rounded-full mb-4">
                        <Cog className="h-10 w-10 text-gray-400" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Розділ у розробці</h3>
                      <p className="text-gray-600">
                        Ця функціональність буде доступна найближчим часом.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing icon component
function Home(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}
