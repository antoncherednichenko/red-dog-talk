"use server";

import { cookies } from "next/headers";

export const getSessionCookies = async () => {
  const cookieStore = await cookies();

  return cookieStore.toString();
};
