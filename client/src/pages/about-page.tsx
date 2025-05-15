import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-primary py-8 -mx-4 px-4 mb-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white">Про нас</h1>
          <p className="mt-2 text-white/90">Дізнайтеся більше про HomeDirect</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden mb-12">
          <div className="md:flex">
            <div className="md:w-1/2">
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1000"
                alt="Команда HomeDirect"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 md:w-1/2">
              <h2 className="text-2xl font-bold mb-4">Наша місія</h2>
              <p className="text-gray-700 mb-6">
                Ми створили HomeDirect з метою усунення посередників між власниками нерухомості та потенційними покупцями або орендарями. 
                Наша місія - зробити процес купівлі, продажу та оренди житла прозорим, справедливим та економічно вигідним для всіх учасників.
              </p>
              <p className="text-gray-700">
                Ми віримо, що прямий зв'язок між власниками та клієнтами не тільки економить гроші обох сторін, але й сприяє більш відкритому та чесному спілкуванню.
              </p>
            </div>
          </div>
        </Card>

        <h2 className="text-2xl font-bold mb-6">Наші переваги</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="p-6">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Без комісій</h3>
            <p className="text-gray-700">
              Ми не стягуємо комісії з покупців або орендарів, а власники нерухомості платять лише за розміщення оголошення.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Безпека</h3>
            <p className="text-gray-700">
              Ми перевіряємо всі оголошення перед публікацією і встановлюємо чіткі правила для забезпечення безпеки користувачів.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-primary flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Прозорість</h3>
            <p className="text-gray-700">
              Ми забезпечуємо повну прозорість інформації про нерухомість, що допомагає зробити правильний вибір.
            </p>
          </Card>
        </div>

        <Card className="mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6">Наша історія</h2>
            
            <p className="text-gray-700 mb-4">
              HomeDirect була заснована в 2023 році групою ентузіастів, які особисто зіткнулися з проблемами на ринку нерухомості України. 
              Високі комісії рієлторів, непрозорі умови та складність прямого спілкування між власниками та клієнтами стали поштовхом для створення цієї платформи.
            </p>
            <p className="text-gray-700 mb-4">
              З моменту запуску наша платформа допомогла тисячам українців знайти житло своєї мрії без переплат посередникам. 
              Ми постійно розвиваємося, впроваджуємо нові функції та покращуємо сервіс на основі відгуків наших користувачів.
            </p>
            <p className="text-gray-700">
              Наша команда складається з професіоналів у сфері технологій, нерухомості та обслуговування клієнтів, які об'єднані спільною метою - 
              зробити ринок нерухомості України більш справедливим та доступним для кожного.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6">Часті запитання</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-2">Чи дійсно безкоштовно розміщувати оголошення?</h3>
                <p className="text-gray-700">
                  Так, базове розміщення оголошень є безкоштовним для всіх зареєстрованих користувачів. Ми також пропонуємо платні опції для підвищення видимості оголошення.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-2">Як перевіряються оголошення?</h3>
                <p className="text-gray-700">
                  Всі оголошення проходять модерацію нашою командою перед публікацією. Ми перевіряємо точність інформації та відповідність правилам сайту.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-2">Чи можу я видалити своє оголошення?</h3>
                <p className="text-gray-700">
                  Так, ви можете в будь-який момент деактивувати або повністю видалити своє оголошення через особистий кабінет.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-2">Як зв'язатися з власником нерухомості?</h3>
                <p className="text-gray-700">
                  Контактна інформація власника доступна на сторінці оголошення. Ви можете зв'язатися з ним телефоном або через форму повідомлень на сайті.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-2">Що робити, якщо я знайшов підозріле оголошення?</h3>
                <p className="text-gray-700">
                  Ви можете повідомити про підозріле оголошення, натиснувши кнопку "Поскаржитись" на сторінці оголошення або зв'язавшись з нашою службою підтримки.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;
