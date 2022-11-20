import { Component, OnInit,Inject,ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrServices } from '../../../../services/toastr.service';

@Component({
  selector: 'app-deletezoneconfirm',
  templateUrl: './deletezoneconfirm.component.html',
  styleUrls: ['./deletezoneconfirm.component.css']
})
export class DeletezoneconfirmComponent implements OnInit {
  zoneData:any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<DeletezoneconfirmComponent>, private toastr :ToastrServices
    ) {
    if (data) {
      this.zoneData = data.zone;
    }
  }

  ngOnInit(): void{ }

  okClick(): void {
    this.dialogRef.close(true)
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }
}
