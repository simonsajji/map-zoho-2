import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  selectedPoints = new BehaviorSubject<any>([]);
  selection = new SelectionModel<any>(true, []);
  showRoutes:any = new BehaviorSubject<any>(false);
  builtRouteExists:any = new BehaviorSubject<any>(false);
  isFirstChangebyMutipleRts:any = new BehaviorSubject<any>(true);
  isUserAccessRoute:any = new BehaviorSubject<any>(true);
  
  constructor() { }

  setSelectedPoints(temp: any): void {
    return this.selectedPoints.next(temp);
  }

  getSelectedPoints() {
    return this.selectedPoints.asObservable();
  }


  getSelectionModel() {
    return this.selection;
  }

  clearSelectionModel() {
    return this.selection.clear();
  }

  select(temp: any) {
    return this.selection.select(temp);
  }
  deselect(temp: any) {
    return this.selection.deselect(temp);
  }


  setShowRoutes(temp: any): void {
    return this.showRoutes.next(temp);
  }

  getShowRoutes() {
    return this.showRoutes.asObservable();
  }
 
  setBuiltRouteExists(temp: any): void {
    return this.builtRouteExists.next(temp);
  }

  checkBuiltRouteExists() {
    return this.builtRouteExists.asObservable();
  }

  setIsFirstChangebyMutipleRts(temp: any): void {
    return this.isFirstChangebyMutipleRts.next(temp);
  }

  getIsFirstChangebyMutipleRts(){
    return this.isFirstChangebyMutipleRts.asObservable();
  }

 

  setisUserAccessRoute(temp: any): void {
    return this.isUserAccessRoute.next(temp);
  }

  getisUserAccessRoute() {
    return this.isUserAccessRoute.asObservable();
  }
 

}
