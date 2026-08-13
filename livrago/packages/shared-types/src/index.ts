export type UserRole = "CUSTOMER" | "BUSINESS" | "DRIVER" | "DELIVERY_COMPANY" | "ADMIN";

export type UserStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  errors?: unknown[];
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  role: UserRole;
  isPhoneVerified: boolean;
  isActive: boolean;
  status: UserStatus;
}
