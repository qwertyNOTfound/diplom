import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VerificationInput from "@/components/ui/verification-input";
import { Mail } from "lucide-react";

const EmailVerificationPage = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");

  // Verify email mutation
  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/verify-email", { code });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Email підтверджено",
        description: "Ваш email успішно підтверджено. Тепер ви можете розміщувати оголошення.",
      });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка підтвердження",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Resend verification email mutation
  const resendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/resend-verification");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Код відправлено",
        description: "Новий код підтвердження відправлено на вашу електронну пошту",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Помилка відправлення",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleVerifyEmail = () => {
    if (verificationCode.length < 6) {
      toast({
        title: "Невірний код",
        description: "Будь ласка, введіть повний 6-значний код підтвердження",
        variant: "destructive",
      });
      return;
    }

    verifyMutation.mutate(verificationCode);
  };

  const handleResendCode = () => {
    resendMutation.mutate();
  };

  if (!user) {
    return null; // Handled by ProtectedRoute
  }

  if (user.isVerified) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Email вже підтверджено</h2>
            <p className="text-gray-600 mb-6">
              Ваша адреса електронної пошти вже підтверджена. Ви можете розміщувати оголошення.
            </p>
            <Button asChild>
              <a href="/dashboard">Перейти до кабінету</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-4">
              <Mail className="h-8 w-8" />
            </div>
            <h2 className="font-sans text-2xl font-bold text-gray-900">Підтвердіть вашу email адресу</h2>
            <p className="text-gray-600 mt-2">
              Ми відправили код підтвердження на вашу електронну пошту {user.email}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Код підтвердження
            </label>
            <VerificationInput
              onChange={setVerificationCode}
              length={6}
            />
          </div>

          <Button
            onClick={handleVerifyEmail}
            className="w-full mb-4"
            disabled={verifyMutation.isPending}
          >
            {verifyMutation.isPending ? "Підтвердження..." : "Підтвердити"}
          </Button>

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Не отримали код?{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={handleResendCode}
                disabled={resendMutation.isPending}
              >
                {resendMutation.isPending ? "Відправлення..." : "Відправити знову"}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationPage;
