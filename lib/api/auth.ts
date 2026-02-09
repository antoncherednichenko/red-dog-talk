import { clientApi } from "./clientApi";
import { API_ENDPOINTS } from "./apiEndpoints";
import { serverApi } from "./serverApi";
import { TAGS } from "./tags";

export interface IRegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export interface IProfileDTO {
  id: string;
  name: string;
  email: string;
}

export const registerUser = async (body: IRegisterDTO) => {
  return await clientApi(API_ENDPOINTS.Register, {
    method: "POST",
    body,
  });
};

export const loginUser = async (body: ILoginDTO) => {
  return await clientApi(API_ENDPOINTS.Login, {
    method: "POST",
    body,
  });
};

export const getProfile = async () => {
  return await serverApi<IProfileDTO>(API_ENDPOINTS.Profile, {
    method: "GET",
    next: {
      tags: [TAGS.Profile],
    },
  });
};
