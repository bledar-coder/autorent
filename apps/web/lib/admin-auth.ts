import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Guard for admin pages: redirects non-admins to the sign-in page. */
export async function requireAdmin(locale: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    redirect(`/${locale}/login`);
  }
  return session.user;
}

/** Guard for server actions: throws instead of redirecting. */
export async function assertAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session.user;
}
