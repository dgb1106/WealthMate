export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface AuthCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData extends AuthCredentials {
    firstName: string;
    lastName: string;
  }