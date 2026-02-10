"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PUBLIC_ROUTES } from "@/lib/constants/routes";
import { logoutUser } from "@/lib/api/auth";

export const logoutAction = async () => {
  try {
    await logoutUser();
  } catch (error) {
    console.error("Logout failed", error);
  }

  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  redirect(PUBLIC_ROUTES.Login);
};
