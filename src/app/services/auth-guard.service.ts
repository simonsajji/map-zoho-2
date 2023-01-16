import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public auth: AuthService, public router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean | any {
    // let roles = route.data['role'];
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['']);
      console.log("not auth")
      return false;
    } 
    else {
      return true;
      // let roleCheck = false;
      // let user: any = this.auth.getUser();
      // let userRole = sessionStorage.getItem('userRole');
      // if(user?.role == userRole) roleCheck = true;
      // if (roleCheck) {
      //   let permissionCheck: boolean = false;
      //   roles?.forEach((element:any) => {
      //     if (userRole === element) permissionCheck = true;
      //   });
      //   if (permissionCheck) return true;
      //   else {
      //     this.router.navigate(['']);
      //   }
      // } else{
      //   sessionStorage.clear();
      //   this.router.navigate(['']);
      // }
    }
  }
}
