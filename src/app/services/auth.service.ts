import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';
import { UserViewsService } from './user-views.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuth:boolean = false;
  private userToken:any;
  constructor(private apiService:ApiService,private userViewService:UserViewsService) {
    this.userViewService.getUserToken().subscribe((item: any) => {
      this.userToken = item;
    });
   }

  isAuthenticated(){
    // let usertoken = sessionStorage.getItem('userToken');    
    // let passtoken = sessionStorage.getItem('passToken');  
    if(this.userToken === "" ) return false;
    else return true;
  }

  getUser(){
    let token = sessionStorage.getItem('userToken');
    if(token === null) return false;
    else return jwt_decode(token);
  }
  
}
