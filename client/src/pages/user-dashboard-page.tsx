import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Listing, User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PlusCircle,
  Home,
  Heart,
  MessageSquare,
  UserCog,
  LogOut,
  Eye,
  Phone,
  CheckCircle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UserDashboardPage = () => {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listings");

  // Fetch user listings
  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/user/listings"],
  });

  // Delete listing mutation
  const deleteMutation = useMutation({
    mutationFn: async (listingId: number) => {
      await apiRequest("DELETE", `/api/listings/${listingId}`);
    },
    onSuccess: () => {
      toast({
        title: "Оголошення видалено",
        description: "Ваше оголошення було успішно видалено",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/listings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка видалення",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteListing = (listingId: number) => {
    deleteMutation.mutate(listingId);
  };

  const getListingStatusBadge = (listing: Listing) => {
    if (listing.approved) {
      return <Badge>Активне</Badge>;
    }
    return <Badge variant="outline">На перевірці</Badge>;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!user) {
    return null; // Handled by ProtectedRoute
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-primary py-8 -mx-4 px-4 mb-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white">Мій кабінет</h1>
          <p className="mt-2 text-white/90">
            Керуйте своїми оголошеннями та налаштуваннями
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <Card className="sticky top-24">
            <CardContent className="p-6">
              <div className="flex items-center border-b pb-6 mb-6">
                <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mr-4">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{`${user.firstName} ${user.lastName}`}</h3>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab("listings")}
                  className={`flex items-center w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === "listings"
                      ? "text-primary bg-primary-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Home className="mr-3 w-5 h-5" />
                  <span>Мої оголошення</span>
                </button>

                <Link
                  href="/create-listing"
                  className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  <PlusCircle className="mr-3 w-5 h-5" />
                  <span>Додати оголошення</span>
                </Link>

                <button
                  onClick={() => setActiveTab("messages")}
                  className={`flex items-center w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === "messages"
                      ? "text-primary bg-primary-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <MessageSquare className="mr-3 w-5 h-5" />
                  <span>Повідомлення</span>
                </button>

                <button
                  onClick={() => setActiveTab("favorites")}
                  className={`flex items-center w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === "favorites"
                      ? "text-primary bg-primary-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Heart className="mr-3 w-5 h-5" />
                  <span>Збережені</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === "settings"
                      ? "text-primary bg-primary-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <UserCog className="mr-3 w-5 h-5" />
                  <span>Налаштування профілю</span>
                </button>

                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="mr-3 w-5 h-5" />
                  <span>Вийти</span>
                </button>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="listings">Мої оголошення</TabsTrigger>
              <TabsTrigger value="messages">Повідомлення</TabsTrigger>
              <TabsTrigger value="favorites">Збережені</TabsTrigger>
              <TabsTrigger value="settings">Налаштування</TabsTrigger>
            </TabsList>

            {/* Listings Tab */}
            <TabsContent value="listings">
              <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Мої оголошення</CardTitle>
                    <CardDescription>
                      Керуйте вашими оголошеннями на платформі
                    </CardDescription>
                  </div>
                  <Button asChild>
                    <Link href="/create-listing">
                      <PlusCircle className="mr-2 h-4 w-4" /> Додати оголошення
                    </Link>
                  </Button>
                </CardHeader>

                <CardContent>
                  {isLoading ? (
                    <div className="py-8 text-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>Завантаження оголошень...</p>
                    </div>
                  ) : !listings || listings.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        У вас немає активних оголошень
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Створіть своє перше оголошення, щоб почати продавати або здавати в оренду нерухомість
                      </p>
                      <Button asChild>
                        <Link href="/create-listing">Створити оголошення</Link>
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Нерухомість</TableHead>
                              <TableHead>Ціна</TableHead>
                              <TableHead>Статус</TableHead>
                              <TableHead>Дата</TableHead>
                              <TableHead className="text-right">Дії</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {listings.map((listing) => (
                              <TableRow key={listing.id}>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0 mr-3">
                                      <img
                                        src={listing.photos[0] || "https://placehold.co/80x80?text=Фото"}
                                        className="h-10 w-10 rounded-md object-cover"
                                        alt={listing.title}
                                      />
                                    </div>
                                    <div className="max-w-xs">
                                      <div className="font-medium text-gray-900 truncate">
                                        {listing.title}
                                      </div>
                                      <div className="text-gray-500 text-sm truncate">
                                        {listing.city}, {listing.district}
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-gray-900 font-medium">
                                    {formatPrice(listing.price)}
                                    {listing.listingType === "rent" && "/міс"}
                                  </div>
                                  <div className="text-gray-500 text-sm">
                                    {listing.listingType === "sale"
                                      ? "Продаж"
                                      : "Оренда"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {getListingStatusBadge(listing)}
                                </TableCell>
                                <TableCell className="text-gray-500 text-sm">
                                  {formatDate(listing.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      asChild
                                      title="Переглянути"
                                    >
                                      <Link href={`/property/${listing.id}`}>
                                        <Eye className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      asChild
                                      title="Редагувати"
                                    >
                                      <Link href={`/property/edit/${listing.id}`}>
                                        <Edit className="h-4 w-4" />
                                      </Link>
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          className="text-red-600 hover:text-red-800"
                                          title="Видалити"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>
                                            Видалити оголошення?
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Ця дія не може бути скасована. Це призведе до
                                            безповоротного видалення вашого оголошення.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Скасувати</AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700"
                                            onClick={() => handleDeleteListing(listing.id)}
                                          >
                                            Видалити
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div className="bg-gray-50 p-4 border-t flex items-center justify-between">
                        <div className="text-gray-600 text-sm">
                          Показано {listings.length} з {listings.length} оголошень
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            disabled
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            className="bg-primary text-white"
                          >
                            1
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            disabled
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Статистика активності</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-4xl font-bold text-primary mb-2">
                        {listings ? listings.length : 0}
                      </div>
                      <div className="text-gray-600">Активних оголошень</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-4xl font-bold text-primary mb-2">0</div>
                      <div className="text-gray-600">Переглядів</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-4xl font-bold text-primary mb-2">0</div>
                      <div className="text-gray-600">Контактів з клієнтами</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-bold mb-3">Остання активність</h3>

                    {listings && listings.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3">
                            <Eye className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-gray-800">
                              Ваше оголошення "{listings[0].title}" переглянули 0 разів за останні 24 години
                            </p>
                            <p className="text-gray-500 text-sm">Сьогодні</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                            <Phone className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-gray-800">
                              Функція відстеження дзвінків буде доступна в наступному оновленні
                            </p>
                            <p className="text-gray-500 text-sm">Скоро</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-3">
                            <CheckCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-gray-800">
                              Ваше оголошення {listings.some(l => l.approved) ? 'схвалено' : 'на перевірці'} модератором
                            </p>
                            <p className="text-gray-500 text-sm">{formatDate(new Date().toISOString())}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">У вас поки немає активності</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle>Повідомлення</CardTitle>
                  <CardDescription>
                    Перегляньте повідомлення від зацікавлених покупців або орендарів
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">У вас немає повідомлень</h3>
                    <p className="text-gray-500">
                      Коли хтось зацікавиться вашим оголошенням, повідомлення з'являться тут
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle>Збережені оголошення</CardTitle>
                  <CardDescription>
                    Перегляньте оголошення, які ви додали в обрані
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="py-8 text-center">
                    <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">У вас немає збережених оголошень</h3>
                    <p className="text-gray-500">
                      Натисніть на сердечко на сторінці оголошення, щоб додати його до збережених
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Налаштування профілю</CardTitle>
                  <CardDescription>
                    Керуйте своїми особистими даними та налаштуваннями
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ім'я</label>
                        <input
                          type="text"
                          value={user.firstName}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Прізвище</label>
                        <input
                          type="text"
                          value={user.lastName}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">По батькові</label>
                      <input
                        type="text"
                        value={user.middleName || ""}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                      <input
                        type="tel"
                        value={user.phone}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
                      />
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-gray-500 mb-4">
                        Для зміни особистих даних зверніться до служби підтримки
                      </p>
                      <Button disabled>Редагувати профіль</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
