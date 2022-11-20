import { Component, OnInit,Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-editcolumn',
  templateUrl: './editcolumn.component.html',
  styleUrls: ['./editcolumn.component.css']
})
export class EditcolumnComponent implements OnInit {

  message: string = "";
  datanew : any;
  columns:any;
  selectedOptions: string[] = [];
  orderedColumns: string[] = [];
 
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<EditcolumnComponent>
    ) {
    
    if (data) {
      this.columns = data.columns ;
      this.selectedOptions = [...data?.selectedcolumns];
      this.orderedColumns = [...data?.orderedColumns]
      this.columns.sort((a:any, b:any)=>{  
        return this.orderedColumns.indexOf(a) - this.orderedColumns.indexOf(b);
      });
      this.datanew = data;
    }
    // this.dialogRef.updateSize('300vw','300vw')
  }

  ngOnInit(): void{ }

  okClick(): void {
    this.dialogRef.close(this.selectedOptions);
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }
  onNgModelChange(ev:any){ }
}
