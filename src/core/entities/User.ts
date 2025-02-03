import { UserRole } from "@prisma/client";

export class User {
    "id": string;
    "email": string;
    "passwordHash": string;
    "firstName": string | null;
    "lastName": string | null;
    "phone": string | null;
    "role": UserRole;
    "emailVerified": boolean;
    "verificationToken": string | null;
    "resetToken": string | null;
    "resetTokenExpiry": Date | null;
    "twoFactorEnabled": boolean;
    "twoFactorSecret": string | null;
    "createdAt": Date;
    "updatedAt": Date;
  
    constructor(data: Partial<User>) {
      Object.assign(this, data);
    }
  }