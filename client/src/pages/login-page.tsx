import { useAuth } from "@/lib/auth";
import { useState, FormEvent, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const { loginMutation, user } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      window.location.href = "/dashboard";
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      return;
    }

    loginMutation.mutate({ password }, {
      onSuccess: () => {
        window.location.href = "/dashboard";
      }
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
      <Card className="w-full max-w-md p-8 mx-4 shadow-lg">
        <CardContent className="p-0">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 mb-4">
              <svg viewBox="0 0 48 48" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:"#3B82F6", stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"#1E40AF", stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <rect fill="url(#gradient)" x="0" y="0" width="48" height="48" rx="12"></rect>
                  <path d="M14,12 L24,12 L34,24 L24,36 L14,36 L24,24 L14,12 Z" fill="#FFFFFF"></path>
                  <circle cx="34" cy="14" r="4" fill="#FFFFFF" opacity="0.7"></circle>
                </g>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800">NOVA</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Пароль</label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-[#C30000]"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Вход...
                  </div>
                ) : (
                  "Войти"
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">© 2023 Все права защищены.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
