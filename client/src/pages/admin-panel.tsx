import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Property } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Loader2,
  AlertTriangle,
  Search,
  Trash2,
} from "lucide-react";
import { Link } from "wouter";

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch properties for admin
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/admin/properties", { status: statusFilter !== "all" ? statusFilter : undefined }],
    enabled: !!user?.isAdmin,
  });

  // Filter properties based on status
  const filteredProperties = statusFilter === "all"
    ? properties
    : properties.filter(property => property.status === statusFilter);

  // Update property status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/properties/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      toast({
        title: "Статус оновлено",
        description: "Статус оголошення успішно оновлено",
      });
      setShowApproveDialog(false);
      setShowRejectDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/properties/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/properties"] });
      toast({
        title: "Успішно видалено",
        description: "Оголошення видалено успішно",
      });
      setShowDeleteDialog(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка видалення",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle approve property
  const handleApproveProperty = () => {
    if (selectedProperty) {
      updateStatusMutation.mutate({ id: selectedProperty.id, status: "approved" });
    }
  };

  // Handle reject property
  const handleRejectProperty = () => {
    if (selectedProperty) {
      updateStatusMutation.mutate({ id: selectedProperty.id, status: "rejected" });
    }
  };

  // Handle delete property
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
            Схвалено
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

  // Not admin warning
  if (user && !user.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-500" />
              <CardTitle>Доступ заборонено</CardTitle>
            </div>
            <CardDescription>
              У вас немає прав адміністратора для доступу до цієї сторінки
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-6">
              Якщо ви вважаєте, що це помилка, зверніться до адміністратора системи.
            </p>
            <Link href="/">
              <Button>
                Повернутися на головну
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Завантаження даних...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Адмін-панель</h1>
      </div>
      <p className="text-gray-600 mb-8">
        Керування оголошеннями та схвалення нових публікацій
      </p>

      <Tabs defaultValue="properties" className="max-w-6xl mx-auto">
        <TabsList className="mb-6">
          <TabsTrigger value="properties">Оголошення</TabsTrigger>
          <TabsTrigger value="users">Користувачі</TabsTrigger>
          <TabsTrigger value="settings">Налаштування</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle>Управління оголошеннями</CardTitle>
                  <CardDescription>
                    Перегляд та модерація оголошень на платформі
                  </CardDescription>
                </div>
                <div>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Статус" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Всі оголошення</SelectItem>
                      <SelectItem value="pending">Очікують схвалення</SelectItem>
                      <SelectItem value="approved">Схвалені</SelectItem>
                      <SelectItem value="rejected">Відхилені</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {filteredProperties.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Search className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Немає оголошень</h3>
                  <p className="text-gray-500">
                    {statusFilter === "all"
                      ? "На платформі ще немає оголошень"
                      : statusFilter === "pending"
                      ? "Немає оголошень, що очікують на схвалення"
                      : statusFilter === "approved"
                      ? "Немає схвалених оголошень"
                      : "Немає відхилених оголошень"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Оголошення</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Власник</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead>Дії</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-mono text-sm">
                          {property.id}
                        </TableCell>
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
                              <div className="font-medium">{property.title}</div>
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
                        <TableCell>
                          <div className="text-sm">
                            {property.contactFirstName} {property.contactLastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {property.contactEmail}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(property.status)}</TableCell>
                        <TableCell className="text-gray-500 whitespace-nowrap">
                          {formatDate(property.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="text-gray-500"
                            >
                              <Link href={`/properties/${property.id}`}>
                                <a>
                                  <Eye className="h-4 w-4" />
                                </a>
                              </Link>
                            </Button>
                            {property.status !== "approved" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-500 hover:text-green-700 hover:bg-green-50"
                                onClick={() => {
                                  setSelectedProperty(property);
                                  setShowApproveDialog(true);
                                }}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {property.status !== "rejected" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => {
                                  setSelectedProperty(property);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setSelectedProperty(property);
                                setShowDeleteDialog(true);
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Управління користувачами</CardTitle>
              <CardDescription>
                Перегляд та редагування користувачів на платформі
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start gap-3 max-w-md">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">
                      Ця функціональність в розробці
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      Управління користувачами буде доступне у наступних оновленнях системи.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Налаштування платформи</CardTitle>
              <CardDescription>
                Змінити базові налаштування платформи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 flex items-start gap-3 max-w-md">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-1">
                      Ця функціональність в розробці
                    </h3>
                    <p className="text-yellow-700 text-sm">
                      Налаштування платформи будуть доступні у наступних оновленнях системи.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Property Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Схвалити оголошення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що бажаєте схвалити це оголошення? Після схвалення воно стане видимим для всіх користувачів сайту.
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
              <Separator className="my-4" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Тип</div>
                  <div>{selectedProperty.dealType === "sale" ? "Продаж" : "Оренда"}</div>
                </div>
                <div>
                  <div className="text-gray-500">Ціна</div>
                  <div>
                    {selectedProperty.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                    {selectedProperty.dealType === "rent" ? " ₴/міс" : " ₴"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Власник</div>
                  <div>
                    {selectedProperty.contactFirstName} {selectedProperty.contactLastName}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Контакт</div>
                  <div>{selectedProperty.contactPhone}</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
            >
              Скасувати
            </Button>
            <Button
              onClick={handleApproveProperty}
              disabled={updateStatusMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {updateStatusMutation.isPending ? "Схвалення..." : "Схвалити"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Property Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Відхилити оголошення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що бажаєте відхилити це оголошення? Воно не буде відображатися для користувачів сайту.
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
              onClick={() => setShowRejectDialog(false)}
            >
              Скасувати
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectProperty}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? "Відхилення..." : "Відхилити"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Property Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Видалити оголошення</DialogTitle>
            <DialogDescription>
              Ви впевнені, що бажаєте повністю видалити це оголошення? Ця дія не може бути скасована.
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
              onClick={() => setShowDeleteDialog(false)}
            >
              Скасувати
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProperty}
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending ? "Видалення..." : "Видалити назавжди"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
