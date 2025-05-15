import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Mail,
  Phone,
  AlertTriangle,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Home,
  Plus,
  Loader2,
} from "lucide-react";
import { Link } from "wouter";

export default function UserProfile() {
  const { user, verifyEmailMutation, resendVerificationMutation } = useAuth();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch user's properties
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/my-properties"],
    enabled: !!user,
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-properties"] });
      toast({
        title: "Успішно видалено",
        description: "Оголошення видалено успішно",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка видалення",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle verification code submit
  const handleVerifyEmail = () => {
    if (!user) return;
    
    verifyEmailMutation.mutate({
      userId: user.id,
      code: verificationCode,
    });
  };

  // Handle resend verification code
  const handleResendCode = () => {
    if (!user?.email) return;
    
    resendVerificationMutation.mutate({ email: user.email });
    startCountdown();
  };

  // Start countdown timer
  const startCountdown = () => {
    setCountdownActive(true);
    setCountdown(60);
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCountdownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle property deletion
  const handleDeleteProperty = () => {
    if (selectedProperty) {
      deletePropertyMutation.mutate(selectedProperty.id);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Очікує схвалення
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Активне
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Відхилено
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Завантаження...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Мій кабінет</h1>

      <Tabs defaultValue="properties" className="max-w-5xl mx-auto">
        <TabsList className="mb-6">
          <TabsTrigger value="properties">Мої оголошення</TabsTrigger>
          <TabsTrigger value="profile">Профіль</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Мої оголошення</h2>
            <Link href="/create-listing">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Створити оголошення
              </Button>
            </Link>
          </div>

          {!user.isVerified && (
            <Card className="mb-6 border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">
                      Підтвердіть вашу електронну пошту
                    </h3>
                    <p className="text-yellow-700 mb-3">
                      Для розміщення оголошень необхідно підтвердити вашу електронну пошту.
                      Ми надіслали код підтвердження на {user.email}.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Введіть код підтвердження"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full sm:w-64 bg-white"
                      />
                      <Button 
                        onClick={handleVerifyEmail}
                        disabled={verifyEmailMutation.isPending}
                        className="shrink-0"
                      >
                        {verifyEmailMutation.isPending ? "Підтвердження..." : "Підтвердити"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleResendCode}
                        disabled={countdownActive || resendVerificationMutation.isPending}
                        className="shrink-0"
                      >
                        {countdownActive
                          ? `Надіслати знову (${countdown})`
                          : resendVerificationMutation.isPending
                          ? "Надсилання..."
                          : "Надіслати код знову"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoadingProperties ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Завантаження оголошень...</span>
            </div>
          ) : properties.length === 0 ? (
            <Card className="text-center p-12">
              <CardContent className="pt-6">
                <Home className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">У вас ще немає оголошень</h3>
                <p className="text-gray-500 mb-6">
                  Створіть своє перше оголошення про продаж або оренду нерухомості
                </p>
                <Link href="/create-listing">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Створити оголошення
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Оголошення</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Ціна</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={property.images[0] || "https://via.placeholder.com/48?text=No+Image"}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <Link href={`/properties/${property.id}`}>
                                <a className="font-medium hover:text-primary">
                                  {property.title}
                                </a>
                              </Link>
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {property.address}, {property.city}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              property.dealType === "sale"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-purple-50 text-purple-700"
                            }
                          >
                            {property.dealType === "sale" ? "Продаж" : "Оренда"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {property.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                          {property.dealType === "rent" ? " ₴/міс" : " ₴"}
                        </TableCell>
                        <TableCell>{getStatusBadge(property.status)}</TableCell>
                        <TableCell className="text-gray-500">
                          {formatDate(property.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link href={`/properties/${property.id}`}>
                                <a className="flex items-center">
                                  <Edit className="h-4 w-4" />
                                </a>
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedProperty(property);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Інформація профілю</CardTitle>
              <CardDescription>
                Ваші персональні дані та контактна інформація
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Ім'я</div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">
                      {user.firstName} {user.lastName}
                      {user.middleName ? ` ${user.middleName}` : ""}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Логін</div>
                  <div className="font-medium">{user.username}</div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">{user.email}</span>
                    {user.isVerified ? (
                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Підтверджено
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Не підтверджено
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-gray-500">Телефон</div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium">
                      {user.phone || "Не вказано"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Редагувати профіль</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Property Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Видалити оголошення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що бажаєте видалити це оголошення? Ця дія не може бути скасована.
            </DialogDescription>
          </DialogHeader>
          {selectedProperty && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded overflow-hidden">
                  <img
                    src={selectedProperty.images[0] || "https://via.placeholder.com/48?text=No+Image"}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium">{selectedProperty.title}</div>
                  <div className="text-sm text-gray-500">
                    {selectedProperty.address}, {selectedProperty.city}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Скасувати
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProperty}
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending ? "Видалення..." : "Видалити"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
