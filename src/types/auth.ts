export enum UserRole {
  ADMIN = 'admin',
  COMPANY = 'company',
  JOB_SEEKER = 'job_seeker'
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile: UserProfile;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  resumeUrl?: string;
  companyName?: string;
  companyDescription?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  location?: string;
  companyName?: string;
  companyDescription?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}