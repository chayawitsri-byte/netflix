"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [key, setKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedKey = localStorage.getItem("license_key");
    if (savedKey) {
      validateStoredKey(savedKey);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const validateStoredKey = async (storedKey: string) => {
    try {
      const res = await fetch(`/api/keys?key=${storedKey}`);
      const data = await res.json();
      if (data.valid) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("license_key");
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("license_key", key);
        setIsAuthenticated(true);
      } else {
        setError(data.error || "Invalid key");
      }
    } catch {
      setError("Connection error");
    }
    setLoading(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
        </div>

        <Card className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border-zinc-800 shadow-2xl relative z-10">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/20">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-zinc-100">Access Required</CardTitle>
            <CardDescription className="text-zinc-400">Please enter your license key to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="ARTY-XXXX-XXXX"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                className="bg-zinc-800/50 border-zinc-700 text-zinc-100 text-center font-mono tracking-widest h-12"
              />
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            </div>
            <Button 
              onClick={handleLogin} 
              disabled={loading || !key} 
              className="w-full h-12 bg-red-600 hover:bg-red-700 transition-all font-semibold"
            >
              {loading ? "Validating..." : "Unlock Access"}
            </Button>
            
            <div className="text-center mt-6">
              <p className="text-zinc-500 text-xs">
                Don't have a key? Contact @ARTY_SUPPORT
              </p>
            </div>
          </CardContent>
        </Card>
        
        <a href="/admin" className="mt-8 text-zinc-800 hover:text-zinc-700 text-[10px] uppercase tracking-[0.2em] transition-colors">
          Admin Portal
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
