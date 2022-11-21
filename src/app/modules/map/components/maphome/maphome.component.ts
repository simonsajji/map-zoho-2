import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-maphome',
  templateUrl: './maphome.component.html',
  styleUrls: ['./maphome.component.css']
})
export class MaphomeComponent implements OnInit {



  

  constructor() { 
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
    });
  }

  ngOnInit(): void {
  }

}
