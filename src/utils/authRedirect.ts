
export interface RedirectPayload {
  role: string;
  registrationCompleted: boolean;
  subscribed: boolean;
}

export const getRedirectPath = (user: RedirectPayload) => {
  if (!user.registrationCompleted) {
    return "/school-registration";
  }

  if (!user.subscribed) {
    return "/plans";
  }

  switch (user.role) {
    case "STUDENT":
      return "/student-dashboard";
    case "TEACHER":
      return "/teacher-dashboard";
    case "ADMIN":
      return "/admin-dashboard";
    default:
      return "/login";
  }
};
