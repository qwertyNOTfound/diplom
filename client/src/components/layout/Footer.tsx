import { useLocation } from "wouter";
import { HomeIcon, Mail, Phone, MapPin, Facebook, Instagram, MessageSquareLock } from "lucide-react";

export default function Footer() {
  const [, navigate] = useLocation();

  return (
    <footer className="bg-slate-900 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer" 
              onClick={() => navigate("/")}
            >
              <HomeIcon className="text-white h-6 w-6" />
              <span className="font-bold text-xl">ВласнаОселя</span>
            </div>
            <p className="text-gray-300 mb-4">
              Платформа для розміщення і пошуку нерухомості без посередників.
              Знаходьте ідеальне житло без комісій та прихованих платежів.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition">
                <MessageSquareLock className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Навігація</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/");
                  }}
                  className="text-gray-300 hover:text-white transition"
                >
                  Головна
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/properties");
                  }}
                  className="text-gray-300 hover:text-white transition"
                >
                  Пошук нерухомості
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/create-listing");
                  }}
                  className="text-gray-300 hover:text-white transition"
                >
                  Розмістити оголошення
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/dashboard");
                  }}
                  className="text-gray-300 hover:text-white transition"
                >
                  Особистий кабінет
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Корисне</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Допомога
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Поширені запитання
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Умови використання
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Політика конфіденційності
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition">
                  Відгуки користувачів
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4">Контакти</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 mt-1 text-gray-300" />
                <span className="text-gray-300">м. Київ, вул. Хрещатик 10, офіс 205</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-gray-300" />
                <span className="text-gray-300">+380 44 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-300" />
                <a href="mailto:info@vlasnaoselya.com" className="text-gray-300 hover:text-white transition">
                  info@vlasnaoselya.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} ВласнаОселя. Всі права захищені.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition">
              Умови використання
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition">
              Політика конфіденційності
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition">
              Допомога
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
