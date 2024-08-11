import Dexie, { Table } from 'dexie';
import { environment } from '../../../environments/environment';
import { User } from '../../user/models/user.model';

// IndexedDB manipulation
export class AppDB extends Dexie {
    users!: Table<User, number>;
  
    constructor() {      
      super(`${environment.dbName}`);
      this.version(1).stores({
        users: '++id, email'      // User registration mockup table
      });      
    }
}
  
export const db = new AppDB();