import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface CurrentUser {
  id: string;
  role: "student" | "teacher";
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.id || !session.user.role) {
    return null;
  }

  return {
    id: session.user.id as string,
    role: session.user.role as "student" | "teacher",
  };
}
