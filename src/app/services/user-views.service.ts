import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

@Injectable({
  providedIn: 'root'
})
export class UserViewsService {
  userViews = new BehaviorSubject<any>([]);
  userToken = new BehaviorSubject<any>("");
  constructor() { }

  setUserToken(temp: any) {
    return this.userToken.next(temp);
  }

  getUserToken() {
    return this.userToken.asObservable();
  }
}
