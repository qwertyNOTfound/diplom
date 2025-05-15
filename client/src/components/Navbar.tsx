import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Home, ChevronDown, Menu, X } from "lucide-react";

const Navbar = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { path: "/", label: "Головна" },
    { path: "/properties", label: "Всі оголошення" },
    { path: "/about", label: "Про нас" },
    { path: "/contact", label: "Контакти" },
  ];

  // Function to get user initials
  const getUserInitials = (user) => {
    if (!user) return "";
    return `${user.firstName[0]}${user.lastName[0]}`;
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary">HomeDirect</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-gray-700 hover:text-primary transition-colors ${
                location === link.path ? "text-primary font-medium" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/dashboard"
              className={`text-gray-700 hover:text-primary transition-colors ${
                location.startsWith("/dashboard") ? "text-primary font-medium" : ""
              }`}
            >
              Мій кабінет
            </Link>
          )}
          {user?.isAdmin && (
            <Link
              href="/admin"
              className={`text-gray-700 hover:text-primary transition-colors ${
                location.startsWith("/admin") ? "text-primary font-medium" : ""
              }`}
            >
              Адмін-панель
            </Link>
          )}
        </nav>

        {/* Auth Buttons (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {!user ? (
            <>
              <Link href="/auth" className="text-primary hover:text-primary/80 transition-colors">
                Увійти
              </Link>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/auth">Реєстрація</Link>
              </Button>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Button asChild variant="secondary" className="bg-secondary text-white hover:bg-secondary/90">
                <Link href="/create-listing">Додати оголошення</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 focus:outline-none">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {getUserInitials(user)}
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      Мій кабінет
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/listings" className="cursor-pointer">
                      Мої оголошення
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      Налаштування
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          Адмін-панель
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500">
                    Вийти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-gray-700 focus:outline-none"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-gray-700 hover:text-primary py-2 transition-colors ${
                  location === link.path ? "text-primary font-medium" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                href="/dashboard"
                className={`text-gray-700 hover:text-primary py-2 transition-colors ${
                  location.startsWith("/dashboard") ? "text-primary font-medium" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Мій кабінет
              </Link>
            )}
            {user?.isAdmin && (
              <Link
                href="/admin"
                className={`text-gray-700 hover:text-primary py-2 transition-colors ${
                  location.startsWith("/admin") ? "text-primary font-medium" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Адмін-панель
              </Link>
            )}

            <hr className="border-gray-200" />

            {!user ? (
              <div className="flex flex-col space-y-3">
                <Link
                  href="/auth"
                  className="text-primary hover:text-primary/80 py-2 transition-colors text-left"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Увійти
                </Link>
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/auth">Реєстрація</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                <Button
                  asChild
                  variant="secondary"
                  className="bg-secondary text-white hover:bg-secondary/90 w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/create-listing">Додати оголошення</Link>
                </Button>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-600 hover:text-gray-800 py-2 transition-colors text-left"
                >
                  Вийти
                </button>
              </div>
            )}

            {!user && (
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="text-xs text-gray-400 hover:text-gray-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Вхід для адміністраторів
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
