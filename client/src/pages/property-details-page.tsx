import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ListingWithPhotos } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Heart, Phone, Mail, Eye, Check, X, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VerifiedBadge } from "@/components/ui/verified-badge";

export default function PropertyDetailsPage() {
  const [match, params] = useRoute("/property/:id");
  const { toast } = useToast();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch property data
  const { data: listing, isLoading } = useQuery<ListingWithPhotos>({
    queryKey: [`/api/listings/${params?.id}`],
    enabled: !!params?.id,
  });

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: !isFavorite ? "Додано до обраного" : "Видалено з обраного",
      description: !isFavorite
        ? "Оголошення додано до списку обраних"
        : "Оголошення видалено зі списку обраних",
    });
  };

  const handleContactOwner = () => {
    toast({
      title: "Контактні дані",
      description: "Зверніться безпосередньо до власника за вказаними контактними даними.",
    });
  };

  // Format creation date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Format price with thousand separators
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uk-UA").format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Оголошення не знайдено</h1>
            <p className="text-gray-600 mb-6">
              На жаль, оголошення не існує або було видалено.
            </p>
            <Link href="/properties">
              <Button>Повернутися до списку оголошень</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get property images or placeholder
  const images = listing.photos && listing.photos.length > 0
    ? listing.photos.map(photo => photo.url)
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080'];

  return (
    <>
      <div className="bg-primary py-8 text-white">
        <div className="container mx-auto px-4">
          <Link href="/properties" className="inline-flex items-center text-white opacity-90 hover:opacity-100 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Назад до списку
          </Link>
          <h1 className="text-3xl font-bold">{listing.title}</h1>
          <p className="mt-2 opacity-90">{`${listing.region}, ${listing.city}, ${listing.district}, ${listing.address}`}</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Image Gallery */}
            <Card className="overflow-hidden mb-8">
              <div className="relative h-96">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${listing.title} - зображення ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity"
                    style={{ opacity: index === currentImage ? 1 : 0 }}
                  />
                ))}
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full bg-white ${
                        index === currentImage ? "opacity-100" : "opacity-60 hover:opacity-100"
                      }`}
                      onClick={() => setCurrentImage(index)}
                    ></button>
                  ))}
                </div>
              </div>
              <div className="p-4 flex overflow-x-auto space-x-3">
                {images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Мініатюра ${index + 1}`}
                    className={`w-24 h-16 object-cover rounded cursor-pointer ${
                      index === currentImage ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setCurrentImage(index)}
                  />
                ))}
              </div>
            </Card>
            
            {/* Property Details */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Опис</h2>
                <p className="text-gray-700 mb-6">{listing.description}</p>
                
                <h3 className="text-xl font-bold mb-3">Деталі нерухомості</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center mr-3">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Тип оголошення</p>
                      <p className="font-medium">{listing.listingType === 'sale' ? 'Продаж' : 'Оренда'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center mr-3">
                      <Home className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Тип нерухомості</p>
                      <p className="font-medium">
                        {listing.propertyType === 'apartment' ? 'Квартира' : 
                         listing.propertyType === 'house' ? 'Будинок' :
                         listing.propertyType === 'commercial' ? 'Комерційна' : 'Земельна ділянка'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center mr-3">
                      <RulerSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Площа</p>
                      <p className="font-medium">{`${listing.area} м²`}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center mr-3">
                      <DoorOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Кількість кімнат</p>
                      <p className="font-medium">{`${listing.rooms} кімн.`}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center mr-3">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Регіон</p>
                      <p className="font-medium">{listing.region}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-primary flex items-center justify-center mr-3">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Дата публікації</p>
                      <p className="font-medium">{formatDate(listing.createdAt.toString())}</p>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-3">Адреса</h3>
                <div className="mb-6">
                  <p className="text-gray-700">{`${listing.region}, ${listing.city}, ${listing.district}, ${listing.address}`}</p>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h3 className="font-bold mb-2">Важлива інформація</h3>
                  <p className="text-gray-700 text-sm">
                    Зв'язуйтесь безпосередньо з власником нерухомості за контактною інформацією праворуч. 
                    Ми не беремо комісії з покупців або орендарів.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Price Card */}
            <Card className="mb-6 sticky top-24">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{
                    listing.listingType === 'sale' 
                      ? `${formatPrice(listing.price)} грн` 
                      : `${formatPrice(listing.price)} грн/міс`
                  }</h3>
                  <span className={`${
                    listing.listingType === 'sale' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  } py-1 px-2 rounded-lg text-sm font-medium`}>
                    {listing.listingType === 'sale' ? 'Продаж' : 'Оренда'}
                  </span>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold mb-3">Контактна інформація</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="text-gray-400 w-6 h-6" />
                      <span className="text-gray-700 ml-2">Власник</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="text-gray-400 w-6 h-6" />
                      <span className="text-gray-700 ml-2">+380 XX XXX XXXX</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full mb-3" onClick={handleContactOwner}>
                  <Phone className="mr-2 h-4 w-4" /> Зателефонувати
                </Button>
                
                <Button variant="secondary" className="w-full mb-3" onClick={handleContactOwner}>
                  <Mail className="mr-2 h-4 w-4" /> Написати повідомлення
                </Button>
                
                <Button variant="outline" className="w-full" onClick={toggleFavorite}>
                  <Heart className={`mr-2 h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} /> 
                  {isFavorite ? "В обраному" : "Додати в обране"}
                </Button>
              </CardContent>
            </Card>
            
            {/* Safety Tips */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-3">Поради безпеки</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start">
                    <Check className="text-green-500 mt-1 mr-2 h-4 w-4" />
                    <span>Завжди зустрічайтеся з продавцем у громадському місці</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-green-500 mt-1 mr-2 h-4 w-4" />
                    <span>Ніколи не надсилайте гроші через ненадійні платіжні системи</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-green-500 mt-1 mr-2 h-4 w-4" />
                    <span>Перевіряйте документи на нерухомість перед здійсненням платежу</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="text-green-500 mt-1 mr-2 h-4 w-4" />
                    <span>Повідомляйте про підозрілі оголошення в службу підтримки</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

// Add imported but unused icons
function Home(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
}

function RulerSquare(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="3" rx="2"/><line x1="9" x2="9" y1="3" y2="21"/><line x1="15" x2="15" y1="3" y2="21"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="3" x2="21" y1="15" y2="15"/></svg>
}

function DoorOpen(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4.562v16.157a1 1 0 0 1-1.242.97L5 20V5.562a2 2 0 0 1 1.515-1.94l4-1A2 2 0 0 1 13 4.561Z"/></svg>
}

function CalendarDays(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
}

function User(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}

function MapPin(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
}
