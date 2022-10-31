import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  selectedPoints = new BehaviorSubject<any>([]);
  selection = new SelectionModel<any>(true, []);

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

 

}
