import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';

@Injectable({
  providedIn: 'root'
})
export class DrawingService {

  drawMode:any = new BehaviorSubject<any>(false);

  constructor() { }

  setDrawMode(temp: any): void {
    return this.drawMode.next(temp);
  }

  getDrawMode() {
    return this.drawMode.asObservable();
  }
}
