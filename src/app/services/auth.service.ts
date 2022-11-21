import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  isAuthenticated(){
    let token = sessionStorage.getItem('userToken');
    //admin
    // let token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NDg4MDQ5ODksImlhdCI6MTY0ODc5Nzc4OSwic3ViIjoiZjUxYjQ2YjQtZjc2ZC00OTExLThhMWQtMjU3MDAxNGI0NzYzIiwidXNlcklkIjoxLCJyb2xlIjoiYWRtaW4iLCJmaXJzdE5hbWUiOiJBZG1pbiIsImxhc3ROYW1lIjoiR1MxIn0.DjkxJRpUTdV8-3dYYfHaG9rsKpgASR0U1nPji1TeL7k";
    // let token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NDkwNzUzMzEsImlhdCI6MTY0OTA2ODEzMSwic3ViIjoiNTc2MGM0NjctZTZmNC00M2IxLWFmNmUtYTIyNDk3MTY2MjA3IiwidXNlcklkIjo2LCJyb2xlIjoidmVuZG9yIiwiZmlyc3ROYW1lIjoiVmVuZG9yMSIsImxhc3ROYW1lIjoiMDEifQ.s_Wz3g9P_MXUZkWoPfsZ-C9_ChOMEulixhUlKPYXspE";
    
    if(token === null) return false;
    else {
      let userCheck = false;
      let decodedToken: any = jwt_decode(token);
      if(decodedToken?.role=='admin') userCheck = true;
      if(userCheck) return true;
      else return false;
    }
  }

  getUser(){
    let token = sessionStorage.getItem('userToken');
    // let token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NDg4MDQ5ODksImlhdCI6MTY0ODc5Nzc4OSwic3ViIjoiZjUxYjQ2YjQtZjc2ZC00OTExLThhMWQtMjU3MDAxNGI0NzYzIiwidXNlcklkIjoxLCJyb2xlIjoiYWRtaW4iLCJmaXJzdE5hbWUiOiJBZG1pbiIsImxhc3ROYW1lIjoiR1MxIn0.DjkxJRpUTdV8-3dYYfHaG9rsKpgASR0U1nPji1TeL7k";
    // let token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE2NDkwNzUzMzEsImlhdCI6MTY0OTA2ODEzMSwic3ViIjoiNTc2MGM0NjctZTZmNC00M2IxLWFmNmUtYTIyNDk3MTY2MjA3IiwidXNlcklkIjo2LCJyb2xlIjoidmVuZG9yIiwiZmlyc3ROYW1lIjoiVmVuZG9yMSIsImxhc3ROYW1lIjoiMDEifQ.s_Wz3g9P_MXUZkWoPfsZ-C9_ChOMEulixhUlKPYXspE";
    if(token === null) return false;
    else return jwt_decode(token);
  }
  
}
