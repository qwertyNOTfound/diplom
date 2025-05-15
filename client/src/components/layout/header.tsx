import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Home, 
  Menu, 
  X, 
  LogOut, 
  User, 
  PlusCircle, 
  Heart, 
  Search, 
  Info, 
  Phone,
  Shield
} from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
    closeMenu();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
          <Home className="text-primary text-2xl" />
          <span className="font-bold text-xl text-primary">ВласнаОселя</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/" className={`${isActive('/') ? 'text-primary' : 'text-gray-700'} hover:text-primary transition-colors`}>
            Головна
          </Link>
          <Link href="/properties" className={`${isActive('/properties') ? 'text-primary' : 'text-gray-700'} hover:text-primary transition-colors`}>
            Всі оголошення
          </Link>
          <Link href="/about" className={`${isActive('/about') ? 'text-primary' : 'text-gray-700'} hover:text-primary transition-colors`}>
            Про нас
          </Link>
          <Link href="/contact" className={`${isActive('/contact') ? 'text-primary' : 'text-gray-700'} hover:text-primary transition-colors`}>
            Контакти
          </Link>
          {user && (
            <Link href="/dashboard" className={`${isActive('/dashboard') ? 'text-primary' : 'text-gray-700'} hover:text-primary transition-colors`}>
              Мій кабінет
            </Link>
          )}
          {user?.isAdmin && (
            <Link href="/admin" className={`${isActive('/admin') ? 'text-primary' : 'text-gray-700'} hover:text-primary transition-colors`}>
              Адмін-панель
            </Link>
          )}
        </nav>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {!user ? (
            <>
              <Link href="/auth" className="text-primary hover:text-primary-700 transition-colors">
                Увійти
              </Link>
              <Link href="/auth">
                <Button>Реєстрація</Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/create-listing">
                <Button variant="secondary">
                  Додати оголошення
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.firstName} {user.lastName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Мій кабінет</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/create-listing" className="w-full cursor-pointer">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Додати оголошення</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="w-full cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Адмін-панель</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Вийти</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-gray-700 focus:outline-none">
          {isMenuOpen ? <X className="text-xl" /> : <Menu className="text-xl" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <Link href="/" onClick={closeMenu} className="text-gray-700 hover:text-primary py-2 transition-colors">
              Головна
            </Link>
            <Link href="/properties" onClick={closeMenu} className="text-gray-700 hover:text-primary py-2 transition-colors">
              Всі оголошення
            </Link>
            <Link href="/about" onClick={closeMenu} className="text-gray-700 hover:text-primary py-2 transition-colors">
              Про нас
            </Link>
            <Link href="/contact" onClick={closeMenu} className="text-gray-700 hover:text-primary py-2 transition-colors">
              Контакти
            </Link>
            {user && (
              <Link href="/dashboard" onClick={closeMenu} className="text-gray-700 hover:text-primary py-2 transition-colors">
                Мій кабінет
              </Link>
            )}
            {user?.isAdmin && (
              <Link href="/admin" onClick={closeMenu} className="text-gray-700 hover:text-primary py-2 transition-colors">
                Адмін-панель
              </Link>
            )}

            <hr className="border-gray-200" />

            {!user ? (
              <div className="flex flex-col space-y-3">
                <Link href="/auth" onClick={closeMenu} className="text-primary hover:text-primary-700 py-2 transition-colors text-left">
                  Увійти
                </Link>
                <Link href="/auth" onClick={closeMenu}>
                  <Button className="w-full">Реєстрація</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Link href="/create-listing" onClick={closeMenu}>
                  <Button variant="secondary" className="w-full">
                    Додати оголошення
                  </Button>
                </Link>
                <Button onClick={handleLogout} variant="outline" className="text-gray-600 hover:text-gray-800 transition-colors text-left">
                  <LogOut className="mr-2 h-4 w-4" /> Вийти
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
