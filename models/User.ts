export interface User {
  _id: string;
  email: string;
  password: string; // This will be hashed
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserInput {
  email: string;
  password: string;
  name?: string;
}
