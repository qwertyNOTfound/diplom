import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HomeIcon, Search, PlusSquare, LogOut, ChevronDown, Menu, X, User } from "lucide-react";

export default function NavBar() {
  const [, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    navigate("/");
  };

  // Add scroll effect to navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // User initial for avatar
  const getUserInitials = () => {
    if (!user) return "";
    
    const firstInitial = user.firstName.charAt(0);
    const lastInitial = user.lastName.charAt(0);
    
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <header className={`bg-white sticky top-0 z-50 ${scrolled ? "shadow-md" : ""}`}>
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <HomeIcon className="text-primary h-6 w-6" />
          <span className="font-bold text-xl text-primary">ВласнаОселя</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }} 
            className="text-gray-700 hover:text-primary transition-colors"
          >
            Головна
          </a>
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              navigate("/properties");
            }} 
            className="text-gray-700 hover:text-primary transition-colors"
          >
            Всі оголошення
          </a>
          {user && (
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate("/dashboard");
              }} 
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Мій кабінет
            </a>
          )}
          {user && user.isAdmin && (
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate("/admin");
              }} 
              className="text-gray-700 hover:text-primary transition-colors"
            >
              Адмін-панель
            </a>
          )}
        </nav>
        
        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {!user ? (
            <>
              <Button 
                variant="ghost" 
                className="text-primary hover:text-primary-600"
                onClick={() => navigate("/auth")}
              >
                Увійти
              </Button>
              <Button 
                className="bg-primary hover:bg-primary-600"
                onClick={() => navigate("/auth")}
              >
                Реєстрація
              </Button>
            </>
          ) : (
            <>
              <Button 
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => navigate("/create-listing")}
              >
                <PlusSquare className="mr-2 h-4 w-4" />
                Додати оголошення
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                      {getUserInitials()}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    Мій кабінет
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/create-listing")}>
                    <PlusSquare className="mr-2 h-4 w-4" />
                    Додати оголошення
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Вийти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          onClick={toggleMenu} 
          className="md:hidden text-gray-700 focus:outline-none"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate("/");
                setIsMenuOpen(false);
              }} 
              className="text-gray-700 hover:text-primary py-2 transition-colors"
            >
              Головна
            </a>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                navigate("/properties");
                setIsMenuOpen(false);
              }} 
              className="text-gray-700 hover:text-primary py-2 transition-colors"
            >
              Всі оголошення
            </a>
            {user && (
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/dashboard");
                  setIsMenuOpen(false);
                }} 
                className="text-gray-700 hover:text-primary py-2 transition-colors"
              >
                Мій кабінет
              </a>
            )}
            {user && user.isAdmin && (
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/admin");
                  setIsMenuOpen(false);
                }} 
                className="text-gray-700 hover:text-primary py-2 transition-colors"
              >
                Адмін-панель
              </a>
            )}
            
            <hr className="border-gray-200" />
            
            {!user ? (
              <div className="flex flex-col space-y-3">
                <Button 
                  variant="ghost" 
                  className="text-primary justify-start hover:text-primary-600 hover:bg-transparent"
                  onClick={() => {
                    navigate("/auth");
                    setIsMenuOpen(false);
                  }}
                >
                  Увійти
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary-600 text-center"
                  onClick={() => {
                    navigate("/auth");
                    setIsMenuOpen(false);
                  }}
                >
                  Реєстрація
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => {
                    navigate("/create-listing");
                    setIsMenuOpen(false);
                  }}
                >
                  <PlusSquare className="mr-2 h-4 w-4" />
                  Додати оголошення
                </Button>
                <Button 
                  variant="ghost" 
                  className="justify-start hover:bg-transparent"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Вийти
                </Button>
              </div>
            )}
            
            <div className="pt-2">
              <Button 
                variant="link" 
                className="text-xs text-gray-400 hover:text-gray-600"
                onClick={() => {
                  navigate("/auth");
                  setIsMenuOpen(false);
                }}
              >
                Вхід для адміністраторів
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
