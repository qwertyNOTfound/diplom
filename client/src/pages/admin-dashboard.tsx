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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  Users, 
  BarChart, 
  Settings, 
  MoreHorizontal,
  Eye, 
  Check, 
  X,
  Calendar,
  DoorOpen,
  Ruler
} from "lucide-react";

interface AdminTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
}

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  const [actionProperty, setActionProperty] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);

  // Admin tabs
  const adminTabs: AdminTab[] = [
    {
      id: "pending",
      label: "Очікують схвалення",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      id: "approved",
      label: "Схвалені оголошення",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      id: "users",
      label: "Користувачі",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "statistics",
      label: "Статистика",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      id: "settings",
      label: "Налаштування",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // Fetch pending properties
  const { 
    data: pendingProperties,
    isLoading: isPendingLoading,
    refetch: refetchPending
  } = useQuery({
    queryKey: ["/api/admin/pending-properties"],
    queryFn: async () => {
      const res = await fetch("/api/admin/pending-properties");
      if (!res.ok) throw new Error("Failed to fetch pending properties");
      return res.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Fetch approved properties
  const { 
    data: approvedProperties,
    isLoading: isApprovedLoading
  } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const res = await fetch("/api/properties");
      if (!res.ok) throw new Error("Failed to fetch properties");
      return res.json();
    },
    enabled: !!user?.isAdmin,
  });

  // Approve property mutation
  const approvePropertyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      await apiRequest("POST", `/api/admin/properties/${propertyId}/approve`);
    },
    onSuccess: () => {
      toast({
        title: "Оголошення схвалено",
        description: "Оголошення успішно схвалено і опубліковано.",
      });
      refetchPending();
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setActionProperty(null);
    },
    onError: (error) => {
      toast({
        title: "Помилка",
        description: `Не вдалося схвалити оголошення: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Reject property mutation
  const rejectPropertyMutation = useMutation({
    mutationFn: async (propertyId: number) => {
      await apiRequest("POST", `/api/admin/properties/${propertyId}/reject`);
    },
    onSuccess: () => {
      toast({
        title: "Оголошення відхилено",
        description: "Оголошення було відхилено і видалено з системи.",
      });
      refetchPending();
      setActionProperty(null);
    },
    onError: (error) => {
      toast({
        title: "Помилка",
        description: `Не вдалося відхилити оголошення: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle confirmation of action
  const confirmAction = () => {
    if (!actionProperty) return;
    
    if (actionProperty.action === 'approve') {
      approvePropertyMutation.mutate(actionProperty.id);
    } else if (actionProperty.action === 'reject') {
      rejectPropertyMutation.mutate(actionProperty.id);
    }
  };

  // Handle property approval
  const handleApproveProperty = (propertyId: number) => {
    setActionProperty({ id: propertyId, action: 'approve' });
  };

  // Handle property rejection
  const handleRejectProperty = (propertyId: number) => {
    setActionProperty({ id: propertyId, action: 'reject' });
  };

  // Format date for display
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA");
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-10">
                <h2 className="text-2xl font-bold mb-4">Доступ заборонено</h2>
                <p className="text-gray-600 mb-6">
                  У вас немає прав адміністратора для доступу до цієї сторінки.
                </p>
                <Button onClick={() => navigate("/")}>
                  Повернутися на головну
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-secondary">Адмін-панель</h2>
                <p className="text-gray-600">Керуйте оголошеннями та користувачами на платформі</p>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <p className="font-semibold text-secondary">
                    {user.firstName} {user.lastName}
                  </p>
                  <Badge className="bg-primary">Адміністратор</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Admin Navigation */}
          <div>
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {adminTabs.map((tab) => (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveTab(tab.id)}
                    >
                      {tab.icon}
                      <span className="ml-3">{tab.label}</span>
                      {tab.count !== undefined && (
                        <Badge className="ml-auto bg-primary">{tab.count}</Badge>
                      )}
                    </Button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Pending Properties */}
              <TabsContent value="pending">
                <Card>
                  <CardHeader>
                    <CardTitle>Оголошення, що очікують схвалення</CardTitle>
                    <CardDescription>
                      Перевірте та схваліть або відхиліть нові оголошення перед публікацією
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isPendingLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
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
                    ) : pendingProperties && pendingProperties.length > 0 ? (
                      <div className="space-y-4">
                        {pendingProperties.map((property: Property) => (
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
                              
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-blue-600"
                                  onClick={() => navigate(`/properties/${property.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Переглянути
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-green-600"
                                  onClick={() => handleApproveProperty(property.id)}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Схвалити
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => handleRejectProperty(property.id)}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Відхилити
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Немає оголошень на перевірці</h3>
                        <p className="text-gray-500">
                          Всі оголошення перевірені. Зазирніть сюди пізніше.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Approved Properties */}
              <TabsContent value="approved">
                <Card>
                  <CardHeader>
                    <CardTitle>Схвалені оголошення</CardTitle>
                    <CardDescription>
                      Перегляд всіх активних оголошень на платформі
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isApprovedLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
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
                    ) : approvedProperties && approvedProperties.length > 0 ? (
                      <div className="space-y-4">
                        {approvedProperties.map((property: Property) => (
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
                              
                              <div className="flex items-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => navigate(`/properties/${property.id}`)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      <span>Переглянути</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRejectProperty(property.id)}>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      <span>Зняти з публікації</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Немає схвалених оголошень</h3>
                        <p className="text-gray-500">
                          Поки що немає жодного схваленого оголошення на платформі.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Користувачі</CardTitle>
                    <CardDescription>
                      Керування користувачами платформи
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Функція в розробці</h3>
                      <p className="text-gray-500">
                        Керування користувачами буде доступне найближчим часом.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="statistics">
                <Card>
                  <CardHeader>
                    <CardTitle>Статистика платформи</CardTitle>
                    <CardDescription>
                      Аналітика та статистика використання платформи
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card className="bg-blue-50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-600">Активні оголошення</p>
                              <p className="text-2xl font-bold text-primary">
                                {approvedProperties?.length || 0}
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                              <i className="fas fa-home"></i>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-green-50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-600">Очікують схвалення</p>
                              <p className="text-2xl font-bold text-green-600">
                                {pendingProperties?.length || 0}
                              </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                              <i className="fas fa-clipboard-check"></i>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-amber-50">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-slate-600">Перегляди за сьогодні</p>
                              <p className="text-2xl font-bold text-amber-600">157</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                              <i className="fas fa-eye"></i>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border-t border-slate-200 pt-6">
                      <h4 className="font-medium text-slate-800 mb-4">
                        Нові оголошення (останні 7 днів)
                      </h4>
                      <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                        <p className="text-slate-500">Графік статистики оголошень</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Налаштування платформи</CardTitle>
                    <CardDescription>
                      Керування налаштуваннями адміністрування
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Функція в розробці</h3>
                      <p className="text-gray-500">
                        Налаштування платформи будуть доступні найближчим часом.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionProperty} onOpenChange={() => setActionProperty(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionProperty?.action === 'approve' 
                ? "Схвалити оголошення" 
                : "Відхилити оголошення"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionProperty?.action === 'approve'
                ? "Ви впевнені, що хочете схвалити це оголошення? Воно стане доступним для перегляду всім користувачам."
                : "Ви впевнені, що хочете відхилити це оголошення? Це призведе до його видалення з системи."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Скасувати</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionProperty?.action === 'approve'
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-red-500 hover:bg-red-600"
              }
              disabled={
                (actionProperty?.action === 'approve' && approvePropertyMutation.isPending) ||
                (actionProperty?.action === 'reject' && rejectPropertyMutation.isPending)
              }
            >
              {actionProperty?.action === 'approve'
                ? (approvePropertyMutation.isPending ? "Схвалення..." : "Схвалити")
                : (rejectPropertyMutation.isPending ? "Відхилення..." : "Відхилити")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
