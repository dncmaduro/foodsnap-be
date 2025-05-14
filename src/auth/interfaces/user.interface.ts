export interface User {
  id?: string;
  fullname: string;
  email: string;
  phonenumber: string;
  password?: string; // Thường không trả về password
  created_at?: Date;
  updated_at?: Date;
}