import { Component, OnInit,Inject, HostListener } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { LocationService } from 'src/app/services/location.service';
import { ToastrServices } from 'src/app/services/toastr.service';
import { environment } from 'src/environments/environment';

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
  loader:boolean = false;
  currentUserViews:any;
  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,private dialogRef: MatDialogRef<EditcolumnComponent>,private locationsService:LocationService,private toastr:ToastrServices,private apiService:ApiService) {    
    if (data) {
      this.columns = data.columns ;
      this.selectedOptions = [...data?.selectedcolumns];
      this.orderedColumns = [...data?.orderedColumns];
      this.currentUserViews = data?.currentUserViews;
      this.datanew = data;
    }
  }

  ngOnInit(): void{ }

  okClick(): void {
    this.updateColumns();
  }

  updateColumns(){
    let currentUserViews = this.currentUserViews?.[0];
    let selectedColumns = "[" + this.selectedOptions + "]";
    selectedColumns = selectedColumns.replace(/,/g," ");
    let payload_ = {
      "User_ID": currentUserViews?.user_id,
      "CRM_User_ID": currentUserViews?.crm_user_id,
      "Zuid": currentUserViews?.zuid,
      "Email": currentUserViews?.email,
      "Role_Name": currentUserViews?.role_name,
      "Profile_Name": currentUserViews?.profile_name,
      "Is_Super_Admin": currentUserViews?.is_super_admin,
      "Is_Admin": currentUserViews?.is_admin,
      "Has_Zmap_Access": currentUserViews?.has_zmap_access,
      "Has_Build_Route_Access": currentUserViews?.has_build_route_access,
      "Has_Zones_Access": currentUserViews?.has_zones_access,
      "Location_Column_Order": selectedColumns,
      "Location_Popup_Info": currentUserViews?.location_popup_info,
      "Edit_Columns_Order": currentUserViews?.edit_columns_order,
      "User_Restricted_Columns": currentUserViews?.user_restricted_columns,
      "Update_By_Admin": currentUserViews?.is_admin
    };
    this.loader = true;
    this.apiService.put(`${environment?.testApiUrl}/update_user_view`, payload_).subscribe(
      (dat:any) => {
        if(dat?.message) this.toastr.success('Successfully updated the columns in Table View');
        this.loader = false;
        this.dialogRef.close(this.selectedOptions)
      },
      (error: any) => {
        // console.log(error);
        if (error?.status == 200) {
          this.toastr.success('The Columns view has been successfully updated');
          this.loader = false;
          this.dialogRef.close(this.selectedOptions);
        }
        else {
          this.loader = false;
          this.toastr.error("Error occured while updating ");
          this.dialogRef.close(this.selectedOptions);
        }
      }
    )
  }

  cancelClick(): void {
    this.dialogRef.close(false);
  }
  
  onNgModelChange(ev:any){ }
}
