export const AuthPaths = {
  login: "/api/auth/login",
  adminLogin: "/api/auth/admin/login",
  logout: "/api/auth/logout",
  register: "/api/auth/register",
  refreshToken: "/api/auth/refresh-token",
  sendOtp: "/api/auth/send-otp",
  verifyOtp: "/api/auth/verify-otp",
  forgotPasswordSendOtp: "/api/auth/forgot-password/send-otp",
  forgotPassword: "/api/auth/forgot-password",
  resetPassword: "/api/auth/reset-password",
  changePassword: "/api/auth/change-password",
} as const;


export const SchoolPaths = {
  subscribe: "/api/subscription/subscribe",
} as const;