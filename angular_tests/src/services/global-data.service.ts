import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { User } from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class GlobalDataService {
  constructor() {}

  private loggedInUser$ = new BehaviorSubject<User>({
    id: '',
    email: '',
    roll: 'unassigned',
    jwt: '',
    route: '',
  });
  loggedInUser: Observable<User> = this.loggedInUser$.asObservable();

  setLoggedInUser(newValue: User) {
    this.loggedInUser$.next(newValue);
    localStorage.setItem('loggedUser', JSON.stringify(newValue));
  }
}
