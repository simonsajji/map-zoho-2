import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";
import { environment } from 'src/environments/environment';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuth:boolean = false
  constructor(private apiService:ApiService) { }

  isAuthenticated(){
    let usertoken = sessionStorage.getItem('userToken');    
    // let passtoken = sessionStorage.getItem('passToken');   
    if(usertoken === null ) return false;
    else return true;
  }

  getUser(){
    let token = sessionStorage.getItem('userToken');
    if(token === null) return false;
    else return jwt_decode(token);
  }
  
}
