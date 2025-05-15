import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PropertyGrid from '@/components/listings/PropertyGrid';
import PropertySearchForm from '@/components/listings/PropertySearchForm';
import { useQuery } from '@tanstack/react-query';

export default function HomePage() {
  const [, navigate] = useLocation();
  
  // Fetch featured properties (newest approved listings)
  const { data: featuredProperties, isLoading } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const res = await fetch('/api/properties');
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    }
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section relative min-h-[500px] flex items-center text-white">
        <div className="absolute inset-0 bg-cover bg-center brightness-75" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')" }}></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Знайдіть свою власну оселю без посередників</h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Оголошення від власників нерухомості без комісій та прихованих платежів.
              Зв'язуйтесь напряму з продавцями та орендодавцями.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button 
                size="lg" 
                variant="default" 
                className="bg-white text-primary hover:bg-gray-100"
                onClick={() => navigate('/properties')}
              >
                Шукати нерухомість
              </Button>
              <Button 
                size="lg" 
                variant="default" 
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => navigate('/create-listing')}
              >
                Розмістити оголошення
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="bg-white py-10">
        <div className="container mx-auto px-4">
          <Card className="max-w-5xl mx-auto shadow-lg -mt-16 relative z-10">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-center">Швидкий пошук нерухомості</h2>
              <PropertySearchForm minimal />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Популярні пропозиції</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Перегляньте найкращі пропозиції від власників нерухомості</p>
          </div>
          
          <PropertyGrid 
            properties={featuredProperties?.slice(0, 3) || []} 
            isLoading={isLoading} 
          />
          
          <div className="text-center mt-10">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary-50"
              onClick={() => navigate('/properties')}
            >
              Переглянути всі оголошення
            </Button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Як це працює</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Три прості кроки для власників та покупців нерухомості</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-5 text-2xl">
                <i className="fas fa-user-plus"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Зареєструйтесь</h3>
              <p className="text-gray-600">Створіть безкоштовний обліковий запис для розміщення або пошуку оголошень</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-5 text-2xl">
                <i className="fas fa-house-user"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Розмістіть оголошення</h3>
              <p className="text-gray-600">Додайте інформацію про вашу нерухомість та завантажте фотографії</p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-5 text-2xl">
                <i className="fas fa-comments"></i>
              </div>
              <h3 className="text-xl font-bold mb-3">Отримуйте запити</h3>
              <p className="text-gray-600">Спілкуйтесь напряму з потенційними покупцями без посередників</p>
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Button 
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => navigate('/create-listing')}
            >
              Розмістити оголошення
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Що говорять наші користувачі</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Відгуки від задоволених власників та покупців нерухомості</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-amber-400">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"Завдяки ВласнаОселя я зміг швидко знайти покупця на свою квартиру без необхідності платити комісію рієлтору. Сервіс дуже зручний і простий у використанні."</p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-600 font-bold">ОК</div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Олександр Ковальчук</h4>
                    <p className="text-gray-500 text-sm">Київ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-amber-400">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"Шукала квартиру для оренди і завдяки ВласнаОселя змогла зв'язатися безпосередньо з власником. Це дозволило мені зекономити значну суму на комісії посередникам."</p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-600 font-bold">МС</div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Марія Степаненко</h4>
                    <p className="text-gray-500 text-sm">Львів</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="text-amber-400">
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star"></i>
                    <i className="fas fa-star-half-alt"></i>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"Сайт має зручний інтерфейс та корисні фільтри для пошуку. Завдяки ВласнаОселя я знайшов саме той будинок, який шукав, без зайвих витрат на послуги рієлторів."</p>
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="w-10 h-10 rounded-full bg-primary-200 flex items-center justify-center text-primary-600 font-bold">ІП</div>
                  </div>
                  <div>
                    <h4 className="font-semibold">Іван Петренко</h4>
                    <p className="text-gray-500 text-sm">Одеса</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
