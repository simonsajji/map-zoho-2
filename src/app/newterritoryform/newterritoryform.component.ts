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
  @ViewChild('name') name :any;
  @ViewChild('color') color :any;
  @ViewChild('code') code :any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<NewterritoryformComponent>, private toastr :ToastrServices
    ) {
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

  ngOnInit(): void{ }

  okClick(): void {
    let isNameDuplicate:boolean = false;
    this.zonesData.map((item:any)=>{
      if(item?.name.toLowerCase() ==this.code.nativeElement.value.toLowerCase()) isNameDuplicate = true;
    })
    if(!isNameDuplicate) this.dialogRef.close({name:this.code.nativeElement.value,color:this.color.nativeElement.value});
    else this.toastr.error('The Zone name already exists')
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }

}
