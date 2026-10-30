export interface AuthUser {
  id: string;
  name: string;
  role: 'user' | 'admin';
  token: string;
  image?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmpassword: string;
  phone?: string;
  gender?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  role: string;
  image?: { secure_url?: string; public_id?: string };
  createdAt: string;
}
