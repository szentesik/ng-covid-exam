import { Injectable, signal } from '@angular/core';
import { NewUser } from './models/new-user.model';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
import { User } from './models/user.model';
import { db } from '../core/db/db';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly CURRENT_USER_KEY = 'currentUser';

  private readonly SEARCH_COUNT_KEY = 'searches';

  private readonly GUEST_SEARCH_LIMIT = 3;

  private readonly _currentUser = signal<User | undefined>(undefined);   
  
  private _searchCount = signal(0);     // Number of searches consumed by unregistered user

  constructor( ) {
    const storedUser = localStorage.getItem(this.CURRENT_USER_KEY);
    if(storedUser) {
      this._currentUser.set(JSON.parse(storedUser));
    }
    
    const searchCount = sessionStorage.getItem(this.SEARCH_COUNT_KEY);
    if(searchCount) {     
      this._searchCount.set(Number(searchCount));
    }
  }

  get currentUser() {
    return this._currentUser.asReadonly();
  }

  get isLoggedIn() {
    return this._currentUser() !== undefined;
  }  

  get guestSearchAllowed() {
    return this._searchCount() < this.GUEST_SEARCH_LIMIT;
  }

  consumeSearchAttempt() {
    if(this.isLoggedIn) {
      return;
    }   
    this._searchCount.set(this._searchCount() + 1);
    this.storeSearchCount();
  }
 
  // Registers a new user with the app
  register(newUser: NewUser) : Observable<User> {    
    return from(db.users.where("email").equalsIgnoreCase(newUser.email).toArray()).pipe(      
      tap(usersFound => { if(usersFound.length > 0) throw new Error('User already exists') }),
      switchMap(_ => from(db.users.add({                        // Storing user (simulating backend with IndexedDB)
          email: newUser.email,
          name: newUser.name,
          password: hashSync(newUser.password, genSaltSync())   // Using bcrypt to create salted hash of password to store in DB
        }))),      
      switchMap(id => of({id, name: newUser.name, email: newUser.email} as User))
    );    
  }
  
  // Tries to log in a registered user
  login(email: string, password: string): Observable<User> {    
    return from(db.users.where("email").equalsIgnoreCase(email).toArray()).pipe(
      tap(usersFound => { if(usersFound.length < 1) throw new Error('User not found') }),
      map(usersFound => usersFound[0]),
      tap(dbUser => {if(!compareSync(password, dbUser.password ?? '')) throw new Error('Password is invalid') }),
      switchMap(dbUser => of({id: dbUser.id, name: dbUser.name, email: dbUser.email} as User)),      
      tap(user => { 
        console.log(`User ${user.name} (${user.email}) logged in.`);
        this._currentUser.set(user);
        this.storeUser(user);
      }),
      tap(() => {
        this._searchCount.set(0);
        this.clearSearchCount();
      })
    );
  }

  // Logs out current user
  logout() {
    this.clearStoredUser();
    this._currentUser.set(undefined);
    sessionStorage.clear();
    return of(true);
  }  

  private storeUser(user: User) {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  private clearStoredUser() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }  

  private storeSearchCount() {
    sessionStorage.setItem(this.SEARCH_COUNT_KEY, this._searchCount().toString());
  }

  private clearSearchCount() {
    sessionStorage.removeItem(this.SEARCH_COUNT_KEY);
  }  
}


