import { User } from '../../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}

export {};
