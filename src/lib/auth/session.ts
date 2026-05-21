import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export interface SessionUser {
  userId: string;
  email: string;
  name: string | null;
  role: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user as typeof session.user & { role?: string };
  return {
    userId: u.id,
    email: u.email,
    name: u.name ?? null,
    role: u.role ?? "admin",
  };
}
