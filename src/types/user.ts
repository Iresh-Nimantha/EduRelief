export type UserRole = "owner" | "admin" | "user";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

