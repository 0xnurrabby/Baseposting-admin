import { cookies } from "next/headers";
import { getSessionCookieName, verifySession } from "./session";

export const requireAuth = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get(getSessionCookieName())?.value;
  const session = await verifySession(token);
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
};
