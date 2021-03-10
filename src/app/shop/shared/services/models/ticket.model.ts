import {User} from './user.model';

export interface Ticket {
  id: string;
  reference: string;
  mobile: number;
  user?: User;
}
