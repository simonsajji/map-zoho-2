import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = "Zmap";
  constructor(){
    const isCookiesEnabled = navigator?.cookieEnabled;
    if(!isCookiesEnabled) window.alert("Kindly enable your browser cookie to proceed further");
  }
}
