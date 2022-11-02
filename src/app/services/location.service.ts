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

  // getShowRoutes(){
  //   return this.showRoutes;
  // }
  // setShowRoutes(temp:boolean){
  //    this.showRoutes = temp;
  // }

  setShowRoutes(temp: any): void {
    return this.showRoutes.next(temp);
  }

  getShowRoutes() {
    return this.showRoutes.asObservable();
  }
 

}
