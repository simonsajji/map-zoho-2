import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-maphome',
  templateUrl: './maphome.component.html',
  styleUrls: ['./maphome.component.css']
})
export class MaphomeComponent implements OnInit {
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(e: KeyboardEvent) {
    if (e.key === 'F12') {
      return false;
    }
    if (e.ctrlKey && e.shiftKey && e.key === "I") {
      return false;
    }
    if (e.ctrlKey && e.shiftKey && e.key === "C") {
      return false;
    }
    if (e.ctrlKey && e.shiftKey && e.key === "J") {
      return false;
    }
    if (e.ctrlKey && e.key == "U") {
      return false;
    }
    return true;
  }
  isCookieEnabled:any;
  
  constructor(private router:Router) { 
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
    this.isCookieEnabled = navigator?.cookieEnabled;
  }

  ngOnInit(): void { }
}
