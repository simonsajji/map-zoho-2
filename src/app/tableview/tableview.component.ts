import { ChangeDetectionStrategy, Component,Input,Output, ElementRef, OnChanges, OnInit, ViewChild,AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { environment } from 'src/environments/environment';
import { animate, animation, style, transition, trigger, useAnimation, state, keyframes } from '@angular/animations';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import { ToastrServices } from 'src/app/services/toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmBoxComponent } from '../confirm-box/confirm-box.component';
import * as moment from 'moment';
import {FormControl} from '@angular/forms';
import {TooltipPosition} from '@angular/material/tooltip';
import { ApiService } from 'src/app/services/api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocationService } from '../services/location.service';

interface TableObj {
  value: string;
  viewValue: string;
}
interface TableMode {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-tableview',
  templateUrl: './tableview.component.html',
  styleUrls: ['./tableview.component.css'],
  animations: [
   
    trigger('tableview', [
      state('false', style({ bottom: '-45%' })),
      state('true', style({ bottom: '-99%' })),
      transition('0 => 1', animate('.24s')),
      transition('1 => 0', animate('.24s'))
    ])
  ]
})
export class TableviewComponent implements OnInit,OnChanges {

  tableview: boolean = true;
  dataBaseColumns:any;

  selection = new SelectionModel<any>(true,[]);
  pgIndex:any = 0;  
  tableObjects: TableObj[] = [
    {value: 'location', viewValue: 'Location'},
  ];
  tableModes: TableMode[] = [
    {value: 'all', viewValue: 'All'},
    {value: 'route', viewValue: 'Route'},
  ];
  selectedTableObject = this.tableObjects[0].value;
  selectedTableMode = this.tableModes[0].value;
  selectedLocations:any = [];
  initiatedRoute:boolean = false;
  masterCheckbox:boolean = false;
  pageSizeperPage:any;
  isFilterActive:boolean = false;
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[4]);
  dataSource :any;
  initialLoader:boolean = false;
  OnRouteOptions:any;
  filteredColumns:any = [];
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild("sarea") sarea: any;
  @ViewChild("mastercheck") mastercheck: any;
  @ViewChild('filterName') filterName :any;
  @ViewChild('filterRouteName') filterRouteName :any;
  @ViewChild('filterAddress') filterAddress :any;
  @ViewChild('filterOnRoute') filterOnRoute :any;
  @Input('fetched_locations') fetched_locations :any;
  @Input('origin') origin :any;
  @Input('destination') destination :any;
  @Input('displayedColumns')   displayedColumns: string[] = [];
  

  constructor(private http: HttpClient,private cdr:ChangeDetectorRef,private toastr:ToastrServices,private dialog:MatDialog,private apiService:ApiService,private locationService:LocationService) {
    // this.dataSource.paginator = this.paginator;
   }

  ngOnInit(): void {
    this.locationService.getSelectedPoints().subscribe((item:any)=>{
      this.selectedLocations = item;
    });
  }

 

  ngOnViewInit(){
    this.dataSource = new MatTableDataSource<any>(this.fetched_locations?.data);
    this.dataSource.paginator = this.paginator;
   
  }

  ngOnChanges(){
    this.selection = this.locationService.getSelectionModel();
    this.dataSource = new MatTableDataSource<any>(this.fetched_locations?.data);
    this.dataSource.paginator = this.paginator;
    this.OnRouteOptions = this.fetched_locations?.data.map((item:any)=>item?.On_Route);
    this.OnRouteOptions = [...new Set(this.OnRouteOptions)];
    console.log(this.OnRouteOptions)

  }

  toggleTableView(){
    this.tableview = !this.tableview;
  }

  logSelection() {
    let count_addedLocations = 0;
    this.selection.selected.forEach((s:any ) =>{
      if( s?.Location_Number!=this.origin?.Location_Number && s?.Location_Number!=this.destination?.Location_Number ){
        const index = this.selectedLocations.findIndex((object:any) => (object?.Location_Number === s?.Location_Number ));
        if (index === -1){
          this.selectedLocations.push(s);
          this.locationService.setSelectedPoints(this.selectedLocations);
          count_addedLocations++;
        }
        else this.toastr.warning(`Location ${s?.Location_Name} already exists in route`)
      }
      else this.toastr.warning(`The Location ${s?.Location_Name} is either Origin or Destination`)
    });

    if(count_addedLocations==1 && count_addedLocations>0) ( (this.initiatedRoute == true) ? this.toastr.success(`Added ${count_addedLocations} more location to Route`) : this.toastr.success(`Added ${count_addedLocations} location to Route`));
    else if(count_addedLocations>1 && count_addedLocations>0) ( (this.initiatedRoute == true) ? this.toastr.success(`Added ${count_addedLocations} more locations to Route`) : this.toastr.success(`Added ${count_addedLocations} locations to Route`));
    // this.selection.clear();
    this.locationService.clearSelectionModel();
    this.masterCheckbox = false;
    this.initiatedRoute = true;
  }

  masterToggle(event:any) {
    // this.isSelectedPage() ?
    //    this.selection.clear() :
    //    this.selectRows();
    this.isSelectedPage() ?
    this.locationService.clearSelectionModel() :
       this.selectRows();
   }

   selectRows() {
    let endIndex: number;
    if(this.dataSource.paginator){
      if (this.dataSource.data.length > (this.dataSource.paginator.pageIndex + 1) * this.dataSource.paginator.pageSize) {
        endIndex = (this.dataSource.paginator.pageIndex + 1) * this.dataSource.paginator.pageSize;
      } else {
        endIndex = this.dataSource.data.length;
      }

      for (let index = (this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize); index < endIndex; index++) {
        // this.selection.select(this.dataSource.data[index]);
        this.locationService.select(this.dataSource.data[index]);
      }
    }    
  }

  deSelectRows() {
    let endIndex: number;
    if(this.dataSource.paginator){
      if (this.dataSource.data.length > (this.dataSource.paginator.pageIndex + 1) * this.dataSource.paginator.pageSize) {
        endIndex = (this.dataSource.paginator.pageIndex + 1) * this.dataSource.paginator.pageSize;
      } else {
        endIndex = this.dataSource.data.length;
      }

      for (let index = (this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize); index < endIndex; index++) {
        // this.selection.deselect(this.dataSource.data[index]);
        this.locationService.deselect(this.dataSource.data[index]);
      }
    }    
  }

  isSelectedPage() {
    const numSelected = this.selection.selected.length;
    const page = this.dataSource.paginator?.pageSize;
    let endIndex: number;
  if(this.dataSource.paginator){
    if ( this.dataSource.data.length > (this.dataSource?.paginator?.pageIndex + 1) * this.dataSource.paginator.pageSize) {
      endIndex = (this.dataSource.paginator.pageIndex + 1) * this.dataSource.paginator.pageSize;
    } else {
      endIndex = this.dataSource.data.length - (this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize);
    }
    this.masterCheckbox = numSelected === endIndex;
    return this.masterCheckbox;
  }
  else return false;    
  }

  selectaRow(row:any,ev:any){
    // if(ev?.checked) this.selection.select(row);
    // else this.selection.deselect(row);
    if(ev?.checked) this.locationService.select(row);
    else this.locationService.deselect(row);
  }

  applyFilter(filterValue: any,column:any) {    
    if(filterValue.target?.value == ''){
      this.isFilterActive = false;
      this.filteredColumns.map((item:any,idx:any)=>{
        if(item==column) this.filteredColumns.splice(idx,1)
      })
    } 
    else { 
      this.isFilterActive = true;
      this.filteredColumns.push(column);
      this.dataSource.filterPredicate = function(data:any, filter: string): any {
      if(column == 'Route') return data?.Route.toLowerCase().includes(filter);
        else if(column == 'Address_Line_1') return data?.Address_Line_1.toLowerCase().includes(filter) ;
        else if(column == 'Location_Name') return data?.Location_Name.toLowerCase().includes(filter) ;
        else if(column == 'On_Route') return data?.On_Route == filterValue ;
      //  else if(this.filterName.nativeElement.value)
        // return data?.Route.toLowerCase().includes(filter) || data?.Address_Line_1.toLowerCase().includes(this.filterAddress.nativeElement.value) ||  data?.On_Route == filterValue || data?.Location_Name.toLowerCase().includes(this.filterName.nativeElement.value);
      };
    if(filterValue?.target?.value) filterValue = filterValue.target?.value?.trim().toLowerCase();
    else filterValue = filterValue;
      // this.dataSource.filter((e:any)=>{
      //   e.Address_Line_1.toLowerCase().includes(this.filterAddress.nativeElement.value) || e.Location_Name.toLowerCase().includes(filter);
      // })
      this.dataSource.filter = filterValue;
      console.log(this.dataSource.filter)
      this.cdr.detectChanges();
   }
  }

 

  clearAllFilters(){
    this.applyFilter('','');
    // this.filterName.target.value = '';
    this.filterName.nativeElement.value = '';
    this.filterAddress.nativeElement.value = '';
    this.filterRouteName.nativeElement.value = '';
    this.filterOnRoute.value = '';
    this.isFilterActive = false;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }


  onChangedPage(event:any){
    this.pageSizeperPage = event?.pageSize;
    this.masterCheckbox = false;
    if(this.selection.selected.length>0){
      const dialogRef = this.dialog.open(ConfirmBoxComponent, {
        data: {
          locations: `${this.selection?.selected?.length}`,
          destinationRoute: `${this.fetched_locations?.data[0]?.Route}`,
        }
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed == true){
          this.logSelection();
          this.masterCheckbox = false;
          this.cdr.detectChanges();
        } 
        else {
          // this.selection.clear();
          this.locationService.clearSelectionModel();
          this.masterCheckbox = false;
        }
      });
    }
  }

 

}
