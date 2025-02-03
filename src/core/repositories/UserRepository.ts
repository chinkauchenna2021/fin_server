import { PrismaClient, UserRole } from '@prisma/client';
import { User } from '../entities/User';
import prisma from '../../infrastructure/prismaClient/globalPrisma';

export class UserRepository {

  async create(user: Partial<User>): Promise<User> {
    const newUser = await prisma?.user.create({
      data: {
        email: user.email!,
        passwordHash: user.passwordHash!,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: UserRole.CUSTOMER,
      },
    });
    return new User(newUser as User);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma?.user.findUnique({ where: { email } });
    return user ? new User(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma?.user.findUnique({ where: { id } });
    return user ? new User(user) : null;
  }


  async findAll(): Promise<User[] | null> {
    const user = await prisma?.user.findMany();
    return user ? user : null;
  }

  async delete(id: string): Promise<User | null> {
    const user = await prisma?.user.delete({where : { id }});
    return user ? new User(user) : null;
  }

  async update(userId:string, updateData: Partial<User>): Promise<User | null> {
    const user = await prisma?.user.update({ data : updateData , where : { id:userId }});
    return user ? new User(user) : null;
  }
}