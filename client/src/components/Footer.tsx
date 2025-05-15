import { Link } from "wouter";
import { Home, Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-secondary-foreground text-white py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Home className="h-6 w-6 text-white" />
              <span className="font-bold text-xl">HomeDirect</span>
            </Link>
            <p className="text-gray-300 mb-4">
              Платформа для розміщення і пошуку нерухомості без посередників.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-bold text-lg mb-4">Навігація</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition">
                  Головна
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-gray-300 hover:text-white transition">
                  Пошук нерухомості
                </Link>
              </li>
              <li>
                <Link href="/create-listing" className="text-gray-300 hover:text-white transition">
                  Розмістити оголошення
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition">
                  Про нас
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition">
                  Контакти
                </Link>
              </li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Корисне</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-white transition">
                  Допомога
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white transition">
                  Поширені запитання
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition">
                  Умови використання
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition">
                  Політика конфіденційності
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-bold text-lg mb-4">Контакти</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-3 text-gray-300" />
                <span className="text-gray-300">м. Київ, вул. Хрещатик 10, офіс 205</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-gray-300" />
                <span className="text-gray-300">+380 44 123 4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-gray-300" />
                <a
                  href="mailto:info@homedirect.ua"
                  className="text-gray-300 hover:text-white transition"
                >
                  info@homedirect.ua
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Links */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} HomeDirect. Всі права захищені.
          </p>
          <div className="flex space-x-4">
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition">
              Умови використання
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition">
              Політика конфіденційності
            </Link>
            <Link href="/help" className="text-gray-400 hover:text-white text-sm transition">
              Допомога
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
