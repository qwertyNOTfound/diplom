import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FaEnvelope } from "react-icons/fa";

export default function VerifyEmailPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const inputRefs = Array(6).fill(0).map(() => React.createRef<HTMLInputElement>());
  
  const { verifyEmailMutation, resendVerificationMutation } = useAuth();
  const { toast } = useToast();
  
  // Get email from URL query parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);
  
  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    // Update the code array
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (!pastedData.match(/^\d+$/)) return;
    
    const digits = pastedData.slice(0, 6).split("");
    const newCode = [...code];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });
    
    setCode(newCode);
    
    // Focus last filled input or the next empty one
    const lastIndex = Math.min(digits.length, 5);
    inputRefs[lastIndex].current?.focus();
  };
  
  const handleVerify = () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive",
      });
      return;
    }
    
    verifyEmailMutation.mutate(
      { email, code: verificationCode },
      {
        onSuccess: () => {
          navigate("/auth");
        },
      }
    );
  };
  
  const handleResendCode = () => {
    if (!email) {
      toast({
        title: "Email not found",
        description: "Please provide your email address",
        variant: "destructive",
      });
      return;
    }
    
    resendVerificationMutation.mutate({ email });
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="space-y-1 items-center text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-primary text-2xl mx-auto mb-4">
              <FaEnvelope />
            </div>
            <CardTitle className="text-2xl">Підтвердіть вашу email адресу</CardTitle>
            <CardDescription>
              Ми відправили код підтвердження на вашу електронну пошту{" "}
              {email && <span className="font-medium">{email}</span>}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Код підтвердження
              </label>
              <div className="flex justify-between gap-2">
                {code.map((digit, index) => (
                  <Input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-full aspect-square text-center text-xl font-bold p-0"
                  />
                ))}
              </div>
            </div>
            
            <Button 
              onClick={handleVerify} 
              className="w-full mb-4"
              disabled={verifyEmailMutation.isPending}
            >
              {verifyEmailMutation.isPending ? "Перевіряємо..." : "Підтвердити"}
            </Button>
          </CardContent>
          
          <CardFooter className="flex flex-col">
            <div className="text-center text-sm text-gray-600">
              Не отримали код?{" "}
              <Button 
                variant="link" 
                onClick={handleResendCode}
                disabled={resendVerificationMutation.isPending}
                className="p-0"
              >
                {resendVerificationMutation.isPending ? "Відправляємо..." : "Відправити знову"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
