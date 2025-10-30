"use client";
import { useMutation } from "@tanstack/react-query";
import { loginRequest, saveAuth, LoginResponse } from "../lib/authClient";

type LoginInput = {
  phone: string;
  pin: string;
};

export function useAuthLogin() {
  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: async (input: LoginInput) => {
  const resp = await loginRequest(input);
  if (!resp?.accessToken) throw new Error("No access token returned");
  // persist token and cooperative id
  saveAuth(resp);
  return resp;
    },
  });
}
