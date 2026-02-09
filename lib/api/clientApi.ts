import { ofetch } from "ofetch";

export const clientApi = ofetch.create({
  baseURL: "/api",
  credentials: "include",
});
