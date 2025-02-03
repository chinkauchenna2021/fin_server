import { User } from '../../core/entities/User'; 

declare global {
  namespace Express {
    interface Request {
      userId?: string; 
      user?: User;  
      userRole?:string
    }
  }
}