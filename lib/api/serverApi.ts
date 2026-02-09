"use server";

import { getSessionCookies } from "./getSessionCookies";

type TServerApiInit = Omit<RequestInit, "body"> & { body?: any };

export const serverApi = async <T>(
  endpoint: string,
  init: TServerApiInit,
): Promise<T> => {
  const cookie = await getSessionCookies();
  const response = await fetch(`${process.env.BASE_URL}/api${endpoint}`, {
    ...init,
    body: JSON.stringify(init.body),
    headers: {
      "Content-Type": "application/json",
      cookie,
      ...init.headers,
    },
  });

  return response.json() as Promise<T>;
};
