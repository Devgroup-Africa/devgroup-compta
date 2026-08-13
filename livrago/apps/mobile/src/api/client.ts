import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? "http://192.168.1.35:4000/api",
  timeout: 15000,
});
