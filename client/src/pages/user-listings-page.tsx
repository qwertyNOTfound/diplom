import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { FaPlus, FaEdit, FaTrashAlt, FaEye, FaStar, FaChartLine } from "react-icons/fa";

export default function UserListingsPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<number | null>(null);
  
  // Redirect if not logged in
  useEffect(() => {
    if (user === null) {
      navigate("/auth");
    }
  }, [user, navigate]);
  
  // Fetch user's properties
  const { data: userProperties, isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/user/properties"],
    enabled: !!user,
  });
  
  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "На перевірці";
      case "approved":
        return "Активне";
      case "rejected":
        return "Відхилено";
      default:
        return "Невідомий статус";
    }
  };
  
  // Get status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA");
  };
  
  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/properties/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/properties"] });
      toast({
        title: "Оголошення видалено",
        description: "Ваше оголошення було успішно видалено",
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
  
  // Confirm delete
  const confirmDelete = (id: number) => {
    setSelectedListingId(id);
    setShowDeleteDialog(true);
  };
  
  // Handle delete
  const handleDelete = () => {
    if (selectedListingId) {
      deletePropertyMutation.mutate(selectedListingId);
    }
  };
  
  return (
    <div>
      <div className="bg-primary py-8 text-white">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Мої оголошення</h1>
          <p className="mt-2 opacity-90">Керуйте своїми оголошеннями про нерухомість</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Ваші оголошення</h2>
              <p className="text-gray-600">Всі ваші оголошення в одному місці</p>
            </div>
            <Button onClick={() => navigate("/create-listing")}>
              <FaPlus className="mr-2" /> Додати оголошення
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <div className="flex items-center p-4 border-b">
                      <Skeleton className="h-12 w-12 rounded-md mr-4" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-2/3 mb-2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                    <div className="p-4 flex justify-between items-center">
                      <div className="flex space-x-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-9 w-9 rounded-md" />
                        <Skeleton className="h-9 w-9 rounded-md" />
                        <Skeleton className="h-9 w-9 rounded-md" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-600">
              Виникла помилка при завантаженні даних. Спробуйте пізніше.
            </div>
          ) : userProperties?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaHome className="text-gray-400 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-2">У вас ще немає оголошень</h3>
                <p className="text-gray-600 mb-6">
                  Розмістіть своє перше оголошення про нерухомість без посередників
                </p>
                <Button onClick={() => navigate("/create-listing")}>
                  <FaPlus className="mr-2" /> Додати оголошення
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userProperties?.map((property: any) => (
                <Card key={property.id}>
                  <CardContent className="p-0">
                    <div className="flex items-center p-4 border-b">
                      <div className="h-16 w-16 flex-shrink-0 mr-4">
                        <img 
                          src={property.images?.[0]?.imageUrl || "https://via.placeholder.com/150?text=No+Image"} 
                          alt={property.title} 
                          className="h-16 w-16 object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg line-clamp-1">{property.title}</h3>
                        <p className="text-gray-600 text-sm line-clamp-1">
                          {property.city}, {property.district}
                        </p>
                      </div>
                      <Badge className={getStatusClass(property.status)}>
                        {getStatusText(property.status)}
                      </Badge>
                    </div>
                    <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
                      <div className="flex flex-wrap gap-4">
                        <div className="text-gray-700">
                          <span className="font-semibold">Ціна:</span>{" "}
                          {property.listingType === "sale" 
                            ? `₴${property.price.toLocaleString()}` 
                            : `₴${property.price.toLocaleString()}/міс`
                          }
                        </div>
                        <div className="text-gray-700">
                          <span className="font-semibold">Дата:</span>{" "}
                          {formatDate(property.createdAt)}
                        </div>
                        <div className="text-gray-700">
                          <span className="font-semibold">Переглядів:</span> 0
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => navigate(`/properties/${property.id}`)}>
                          <FaEye className="mr-2" /> Переглянути
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => alert("Функція в розробці")}>
                          <FaChartLine className="mr-2" /> Статистика
                        </Button>
                        {property.status !== "rejected" && (
                          <Button size="sm" variant="outline" onClick={() => alert("Функція в розробці")}>
                            <FaEdit className="mr-2" /> Редагувати
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => confirmDelete(property.id)}
                        >
                          <FaTrashAlt />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Stats cards */}
          {userProperties && userProperties.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-4">
                    <FaHome className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Всього оголошень</p>
                    <p className="text-2xl font-bold">{userProperties?.length || 0}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-4">
                    <FaEye className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Активних оголошень</p>
                    <p className="text-2xl font-bold">
                      {userProperties?.filter(p => p.status === "approved").length || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mr-4">
                    <FaStar className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">На перевірці</p>
                    <p className="text-2xl font-bold">
                      {userProperties?.filter(p => p.status === "pending").length || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Delete confirmation dialog */}
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Видалити оголошення</AlertDialogTitle>
                <AlertDialogDescription>
                  Ви впевнені, що хочете видалити це оголошення? Ця дія незворотна.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Скасувати</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  {deletePropertyMutation.isPending ? "Видаляємо..." : "Видалити"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
