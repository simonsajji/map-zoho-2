import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

@Injectable({
  providedIn: 'root'
})
export class UserViewsService {
  userViews = new BehaviorSubject<any>([]);
  constructor() { }

}
