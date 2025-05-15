import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { Property } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, MapPin, Phone, MessageSquare, Heart, Home, Ruler, DoorOpen, Calendar, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function PropertyDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch property details
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch property details');
      }
      return res.json();
    },
  });

  // Check if the property is in user's favorites
  useEffect(() => {
    if (user && id) {
      (async () => {
        try {
          const res = await fetch(`/api/favorites/${id}`);
          if (res.ok) {
            const data = await res.json();
            setIsFavorite(data.isFavorite);
          }
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      })();
    }
  }, [user, id]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: 'Потрібна авторизація',
        description: 'Будь ласка, увійдіть або зареєструйтеся, щоб додавати об\'єкти до обраного',
        variant: 'default',
      });
      navigate('/auth');
      return;
    }

    try {
      if (isFavorite) {
        await apiRequest('DELETE', `/api/favorites/${id}`);
        setIsFavorite(false);
        toast({
          title: 'Успішно',
          description: 'Об\'єкт видалено з обраного',
        });
      } else {
        await apiRequest('POST', `/api/favorites/${id}`);
        setIsFavorite(true);
        toast({
          title: 'Успішно',
          description: 'Об\'єкт додано до обраного',
        });
      }
    } catch (error) {
      toast({
        title: 'Помилка',
        description: 'Не вдалося оновити статус обраного',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <Skeleton className="h-96 w-full rounded-xl mb-8" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="lg:w-1/3">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-2">Помилка</h2>
              <p className="text-gray-600 mb-4">
                Не вдалося завантажити інформацію про цей об\'єкт нерухомості.
              </p>
              <Button onClick={() => navigate('/properties')}>
                <ChevronLeft className="mr-2 h-4 w-4" /> Повернутися до списку
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA');
  };

  return (
    <div>
      <div className="bg-primary-600 py-8 text-white">
        <div className="container mx-auto px-4">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white hover:bg-primary-700 mb-4"
            onClick={() => navigate('/properties')}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Назад до списку
          </Button>
          <h1 className="text-3xl font-bold">{property.title}</h1>
          <p className="mt-2 opacity-90 flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            {property.region}, {property.city}, {property.district}, {property.address}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {/* Image Gallery */}
            <Card className="mb-8 overflow-hidden">
              <div className="relative h-96">
                {property.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${property.title} - фото ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: index === currentImageIndex ? 1 : 0 }}
                  />
                ))}
                
                {/* Navigation arrows */}
                {property.photos.length > 1 && (
                  <>
                    <button 
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === 0 ? property.photos.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      onClick={() => setCurrentImageIndex((prev) => 
                        prev === property.photos.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                    >
                      <ChevronLeft className="h-6 w-6 transform rotate-180" />
                    </button>
                  </>
                )}
                
                {/* Indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {property.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Thumbnails */}
              <div className="p-4 flex overflow-x-auto space-x-3">
                {property.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-24 h-16 object-cover rounded cursor-pointer transition ${
                      index === currentImageIndex ? 'ring-2 ring-primary' : 'hover:opacity-80'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </Card>
            
            {/* Property Details */}
            <Card>
              <Tabs defaultValue="description">
                <TabsList className="p-0 bg-gray-100">
                  <TabsTrigger value="description" className="flex-1">Опис</TabsTrigger>
                  <TabsTrigger value="details" className="flex-1">Деталі</TabsTrigger>
                  <TabsTrigger value="location" className="flex-1">Розташування</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Опис</h2>
                  <p className="text-gray-700 whitespace-pre-line mb-6">{property.description}</p>
                </TabsContent>
                
                <TabsContent value="details" className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Деталі нерухомості</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary flex items-center justify-center mr-3">
                        <Tag size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Тип оголошення</p>
                        <p className="font-medium">{property.listingType === 'sale' ? 'Продаж' : 'Оренда'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary flex items-center justify-center mr-3">
                        <Home size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Тип нерухомості</p>
                        <p className="font-medium">{property.propertyType === 'apartment' ? 'Квартира' : 'Будинок'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary flex items-center justify-center mr-3">
                        <Ruler size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Площа</p>
                        <p className="font-medium">{property.area} м²</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary flex items-center justify-center mr-3">
                        <DoorOpen size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Кількість кімнат</p>
                        <p className="font-medium">{property.rooms} кімн.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary flex items-center justify-center mr-3">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Регіон</p>
                        <p className="font-medium">{property.region}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-100 text-primary flex items-center justify-center mr-3">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Дата публікації</p>
                        <p className="font-medium">{formatDate(property.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="location" className="p-6">
                  <h2 className="text-2xl font-bold mb-4">Адреса</h2>
                  <p className="text-gray-700 mb-6">
                    {property.region}, {property.city}, {property.district}, {property.address}
                  </p>
                  <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500">Карта розташування</p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Price Card */}
            <Card className="mb-6 sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">
                    {property.listingType === 'sale' 
                      ? `${property.price.toLocaleString()} грн` 
                      : `${property.price.toLocaleString()} грн/міс`
                    }
                  </h3>
                  <span className="bg-amber-100 text-amber-700 py-1 px-2 rounded-lg text-sm font-medium">
                    {property.listingType === 'sale' ? 'Продаж' : 'Оренда'}
                  </span>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold mb-3">Контактна інформація</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Phone className="text-gray-400 w-6 h-6 mr-2" />
                      <span className="text-gray-700">+380 XX XXX XX XX</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3 mb-3">
                  <Button className="w-full bg-primary hover:bg-primary-600">
                    <Phone className="mr-2 h-4 w-4" /> Зателефонувати
                  </Button>
                  
                  <Button className="w-full bg-amber-500 hover:bg-amber-600">
                    <MessageSquare className="mr-2 h-4 w-4" /> Написати повідомлення
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className={`w-full ${isFavorite ? 'text-red-500 border-red-500 hover:bg-red-50' : ''}`}
                    onClick={toggleFavorite}
                  >
                    <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-red-500' : ''}`} /> 
                    {isFavorite ? 'В обраному' : 'Додати до обраного'}
                  </Button>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold mb-2">Важлива інформація</h3>
                  <p className="text-gray-700 text-sm">
                    Зв'язуйтесь безпосередньо з власником нерухомості за контактною інформацією.
                    Ми не беремо комісії з покупців або орендарів.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Safety Tips */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-3">Поради безпеки</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Завжди зустрічайтеся з продавцем у громадському місці</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Ніколи не надсилайте гроші через ненадійні платіжні системи</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Перевіряйте документи на нерухомість перед здійсненням платежу</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Повідомляйте про підозрілі оголошення в службу підтримки</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
