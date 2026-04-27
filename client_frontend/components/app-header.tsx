"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  clearAuthTokenFromStorage,
  clearAuthUserFromStorage,
  getAuthTokenFromStorage,
  getAuthUserFromStorage,
  notifyAuthChanged,
} from "@/lib/auth";

const readSession = () => {
  const token = getAuthTokenFromStorage();
  const user = getAuthUserFromStorage();
  return { token, user };
};

export function AppHeader() {
  const [{ token, user }, setSession] = React.useState<ReturnType<typeof readSession>>({
    token: null,
    user: null,
  });

  const handleLogout = () => {
    clearAuthTokenFromStorage();
    clearAuthUserFromStorage();
    notifyAuthChanged();
  };

  React.useEffect(() => {
    const sync = () => setSession(readSession());

    sync();

    globalThis.addEventListener("storage", sync);
    globalThis.addEventListener("auth-changed", sync as EventListener);

    return () => {
      globalThis.removeEventListener("storage", sync);
      globalThis.removeEventListener("auth-changed", sync as EventListener);
    };
  }, []);

  const displayName = user?.displayName || user?.email;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/60 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Tickety
        </Link>

        <nav className="flex items-center gap-2">
          {token ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {displayName ? `Signed in as ${displayName}` : "Signed in"}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
