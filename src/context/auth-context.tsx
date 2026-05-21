"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { authClient } from "@/lib/auth/client";
import { useToast } from "@/hooks/use-toast";

// Shape kept compatible with the legacy Firebase auth context so existing
// components don't break. `user` is now Better Auth's session user.
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session, isPending } = authClient.useSession();
  const { toast } = useToast();

  const user: AuthUser | null = session?.user
    ? {
        uid: session.user.id,
        email: session.user.email ?? null,
        displayName: session.user.name ?? null,
      }
    : null;

  const login = async (email: string, password: string) => {
    const { error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message ?? "Login failed");
  };

  const logout = async () => {
    await authClient.signOut();
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };

  return (
    <AuthContext.Provider value={{ user, loading: isPending, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
