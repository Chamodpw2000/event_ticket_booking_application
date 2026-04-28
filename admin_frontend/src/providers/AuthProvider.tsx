"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  AuthUser,
  getToken,
  getStoredUser,
  setToken,
  setStoredUser,
  clearAuth,
} from "@/lib/auth";
import { userClient } from "@/api/client";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

const PUBLIC_PATHS = ["/login"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // Redirect logic
  useEffect(() => {
    if (isLoading) return;

    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!token && !isPublic) {
      router.replace("/login");
    } else if (token && isPublic) {
      router.replace("/");
    }
  }, [isLoading, token, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await userClient.post("/users/login", { email, password });
      const { token: newToken, user: newUser } = res.data;

      setToken(newToken);
      setStoredUser(newUser);
      setTokenState(newToken);
      setUser(newUser);

      router.replace("/");
    },
    [router]
  );

  const logout = useCallback(() => {
    clearAuth();
    setTokenState(null);
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
