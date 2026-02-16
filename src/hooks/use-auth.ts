import { useState, useEffect, useCallback } from "react";
import type { UserProfile } from "@/lib/types";

const AUTH_KEY = "need1valo_auth";

function loadUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveUser(user: UserProfile | null) {
  if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_KEY);
}

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(loadUser);

  useEffect(() => { saveUser(user); }, [user]);

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    // Mock: check if user exists in "database"
    const usersRaw = localStorage.getItem("need1valo_users") || "[]";
    const users: (UserProfile & { password: string })[] = JSON.parse(usersRaw);
    const found = users.find(u => u.email === email);
    if (!found) return { success: false, error: "Account not found" };
    if (found.password !== password) return { success: false, error: "Incorrect password" };
    const { password: _, ...profile } = found;
    setUser(profile);
    return { success: true };
  }, []);

  const signup = useCallback((data: { username: string; riotId: string; email: string; password: string }): { success: boolean; error?: string } => {
    const usersRaw = localStorage.getItem("need1valo_users") || "[]";
    const users: (UserProfile & { password: string })[] = JSON.parse(usersRaw);
    if (users.find(u => u.email === data.email)) return { success: false, error: "Email already registered" };

    const newUser = {
      id: crypto.randomUUID(),
      username: data.username,
      riotId: data.riotId,
      email: data.email,
      password: data.password,
      createdAt: Date.now(),
    };
    users.push(newUser);
    localStorage.setItem("need1valo_users", JSON.stringify(users));
    const { password: _, ...profile } = newUser;
    setUser(profile);
    return { success: true };
  }, []);

  const logout = useCallback(() => { setUser(null); }, []);

  const updateProfile = useCallback((updates: Partial<Pick<UserProfile, "username" | "riotId" | "verifiedRank">>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      // Also update in users list
      const usersRaw = localStorage.getItem("need1valo_users") || "[]";
      const users = JSON.parse(usersRaw);
      const idx = users.findIndex((u: any) => u.id === prev.id);
      if (idx >= 0) { users[idx] = { ...users[idx], ...updates }; localStorage.setItem("need1valo_users", JSON.stringify(users)); }
      return updated;
    });
  }, []);

  return { user, login, signup, logout, updateProfile, isLoggedIn: !!user };
}
