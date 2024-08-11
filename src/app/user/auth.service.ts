import { inject, Injectable, signal } from '@angular/core';
import { NewUser } from './models/new-user.model';
import { toObservable } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { User } from './models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly CURRENT_USER_KEY = 'currentUser';

  private readonly _currentUser = signal<User | undefined>(undefined);  

  constructor(    
    private readonly router: Router
  ) {
    const storedUser = localStorage.getItem(this.CURRENT_USER_KEY);
    if(storedUser) {
      this._currentUser.set(JSON.parse(storedUser));
    } 
  }

  get currentUser() {
    return this._currentUser.asReadonly();
  }

  get isLoggedIn() {
    return this._currentUser() !== undefined;
  }

  register(newUser: NewUser) : Observable<User> {
    //TODO: check user in IndexedDB and store if not exists.
    return of({
      username: newUser.username,
      email: newUser.email,
    });
  }
  
  login(email: string, password: string): Observable<User> {
    
    // TODO: check user in IndexedDB
    let user: User = {
      email, 
      username: 'Minta Mókus' 
    }
    this._currentUser.set(user);
    this.storeUser(user);
    return of(user);
  }

  logout() {
    this.clearStoredUser();
    this._currentUser.set(undefined);
    return of(true);
  }  

  private storeUser(user: User) {
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
  }

  private clearStoredUser() {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

}
