import api from "@/lib/api";
import {
  LoginPayload,
  RegisterPayload,
} from "@/types/auth";

export const login = async (
  data: LoginPayload
) => {
  const response = await api.post(
    "/auth/login",
    data
  );

  return response.data;
};

export const register = async (
  data: RegisterPayload
) => {
  const response = await api.post(
    "/auth/register",
    data
  );

  return response.data;
};
