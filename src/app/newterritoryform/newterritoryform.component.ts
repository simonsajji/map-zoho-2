import { Component, OnInit,Inject,ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrServices } from '../services/toastr.service';

@Component({
  selector: 'app-newterritoryform',
  templateUrl: './newterritoryform.component.html',
  styleUrls: ['./newterritoryform.component.css']
})
export class NewterritoryformComponent implements OnInit {

  message: string = "";
  datanew : any;
  columns:any;
  zonesData:any;
  zoneName:string = "";
  zoneColor:string = "";
  zoneComments:string = "";
  colorCode:any = '#0388fc'
  @ViewChild('name') name :any;
  @ViewChild('color') color :any;
  @ViewChild('code') code :any;
  @ViewChild('comments') comments :any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<NewterritoryformComponent>, private toastr :ToastrServices
    ) {
    dialogRef.disableClose = true;  
    if (data) {
      this.zonesData = [...data?.zones];
    }
  }

  setnewZoneColor(ev:any){
    this.zoneColor = this.color.nativeElement.value;  
  }

  setnewZoneName(ev:any){
    this.zoneName = this.name.nativeElement.value;
  }

  setnewZoneComments(ev:any){
    this.zoneComments = this.comments.nativeElement.value;
  }

  colorChange(ev:any){
  
    this.colorCode = ev;
  }

  ngOnInit(): void{ }

  okClick(): void {
    if(this.code.nativeElement.value=='' || this.comments.nativeElement.value=='' || this.code.nativeElement.value==' '){
      this.toastr.warning('Please enter the fields before saving the new Territory');
      return;
    }
    else{
      let isNameDuplicate:boolean = false;
      this.zonesData.map((item:any)=>{
        if(item?.name.toLowerCase() ==this.code.nativeElement.value.toLowerCase()) isNameDuplicate = true;
      })
      if(!isNameDuplicate) this.dialogRef.close({name:this.code.nativeElement.value,color:this.colorCode,comments:this.comments?.nativeElement?.value});
      else this.toastr.error('The Zone name already exists');

    }
    
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }

}
