import { ChangeDetectionStrategy, Component, Input, Output, ElementRef, OnChanges, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, SimpleChanges, HostListener, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { animate, animation, style, transition, trigger, useAnimation, state, keyframes } from '@angular/animations';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { ToastrServices } from 'src/app/services/toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmBoxComponent } from '../confirm-box/confirm-box.component';
import * as moment from 'moment';
import { FormControl } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip';
import { ApiService } from 'src/app/services/api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocationService } from '../../../../services/location.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { EditcolumnComponent } from '../editcolumn/editcolumn.component'
import { isThisSecond } from 'date-fns';
import { DrawingService } from '../../../../services/drawing.service';
import { UserViewsService } from 'src/app/services/user-views.service';

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
      state('false', style({ bottom: '-40%' })),
      state('true', style({ bottom: '-99.5%' })),
      transition('0 => 1', animate('.24s')),
      transition('1 => 0', animate('.24s'))
    ]),
    trigger('drawingmode', [
      state('false', style({ bottom: '-99.5%' })),
      state('true', style({ bottom: '-120%' })),
      transition('0 => 1', animate('.24s')),
      transition('1 => 0', animate('.24s'))
    ])
  ]
})
export class TableviewComponent implements OnInit, OnChanges {

  tableview: boolean = true;
  dataBaseColumns: any;

  selection = new SelectionModel<any>(true, []);
  pgIndex: any = 0;
  tableObjects: TableObj[] = [
    { value: 'location', viewValue: 'Location' },
  ];
  tableModes: TableMode[] = [
    { value: 'all', viewValue: 'All' },
    { value: 'route', viewValue: 'Route' },
  ];
  selectedTableObject = this.tableObjects[0].value;
  selectedTableMode = this.tableModes[0].value;
  selectedLocations: any = [];
  initiatedRoute: boolean = false;
  masterCheckbox: boolean = false;
  pageSizeperPage: any;
  isFilterActive: boolean = false;
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[4]);
  dataSource: any;
  initialLoader: boolean = false;
  OnRouteOptions: any;
  filteredColumns: any = [];
  enabledAddressFilter: boolean = true;
  enabledLocationNameFilter: boolean = true;
  enabledAddressLine1Filter: boolean = true;
  enabledRouteFilter: boolean = true;
  enabledOnRouteFilter: boolean = true;
  orderedColumns: any;
  enableDrawingMode: boolean = false;
  firstChangefromMultipleRoutes: boolean = true;
  isBuiltRouteExists: boolean = false;
  @ViewChild(MatPaginator) paginator: MatPaginator | any;
  @ViewChild("sarea") sarea: any;
  @ViewChild("mastercheck") mastercheck: any;
  @ViewChild('filterName') filterName: any;
  @ViewChild('filterAddressLine1') filterAddressLine1: any;
  @ViewChild('filterRouteName') filterRouteName: any;
  @ViewChild('filterAddress') filterAddress: any;
  @ViewChild('filterOnRoute') filterOnRoute: any;
  @Input('fetched_locations') fetched_locations: any;
  @Input('origin') origin: any;
  @Input('destination') destination: any;
  @Input('displayedColumns') displayedColumns: string[] = [];
  @Input('showRoutes') showRoutes: boolean = false;
  @Input('initialLoaderTable') initialLoaderTable: boolean = false;
  @Output('firstChangeAddMultipleRouteEvent') firstChangeAddMultipleRouteEvent = new EventEmitter();
  shownColumns:any = [];
  accessibleColumns:any = [];
  currentUserViews:any;
  userToken:any;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef,private userViewService:UserViewsService ,private toastr: ToastrServices, private dialog: MatDialog, private apiService: ApiService, private locationService: LocationService, private drawingService: DrawingService) { }

  ngOnInit(): void {
    this.pageSizeperPage = 70;
    this.userViewService.getUserToken().subscribe((item: any) => {
      this.userToken = item;
    })
    this.getTableColumnViews();
    this.locationService.getSelectedPoints().subscribe((item: any) => {
      this.selectedLocations = item;
    });
    this.drawingService.getDrawMode().subscribe((item: any) => {
      this.enableDrawingMode = item;
    });
    this.locationService.checkBuiltRouteExists().subscribe((item: any) => {
      this.isBuiltRouteExists = item;
      if (!this.isBuiltRouteExists) this.firstChangefromMultipleRoutes = true;
      this.firstChangeAddMultipleRouteEvent.emit(this.firstChangefromMultipleRoutes)

    });
    this.locationService.getIsFirstChangebyMutipleRts().subscribe((item: any) => {
      this.firstChangefromMultipleRoutes = item;
    })
  }

  ngOnViewInit() {
    this.dataSource = new MatTableDataSource<any>(this.fetched_locations?.data);
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges) {
    this.selection = this.locationService.getSelectionModel();
    this.dataSource = new MatTableDataSource<any>(this.fetched_locations?.data);
    if (this.fetched_locations?.data) this.dataBaseColumns = Object.keys(this.fetched_locations?.data[0]);
    this.orderedColumns = [...this.shownColumns];
    if (this.dataBaseColumns) {
      this.dataBaseColumns?.map((item: any, idx: any) => {
        if (!this.orderedColumns.includes(item)) this.orderedColumns.push(item)
      })

    }
    this.dataSource.paginator = this.paginator;
    this.OnRouteOptions = this.fetched_locations?.data.map((item: any) => item?.On_Route);
    this.OnRouteOptions = [...new Set(this.OnRouteOptions)];
    if (changes['initialLoaderTable']) this.clearAllFilters();
  }

  getTableColumnViews(){
    let payload = {
      "Email":this.userToken
     }

     this.apiService.post(`${environment.coreApiUrl}/user_views/${payload?.Email}`,payload).subscribe(
      (data:any)=>{
        this.currentUserViews = data;
        let accessibleColumnsString = this.currentUserViews[0]?.edit_columns_order;
        let accessibleColumns = accessibleColumnsString?.substring(1, accessibleColumnsString?.length-1).split(" ");
        this.accessibleColumns = accessibleColumns;
        let shownColumnsString = this.currentUserViews[0]?.location_table_column_order;
        let shownColumns = shownColumnsString?.substring(1, shownColumnsString?.length-1).split(" ");
        this.shownColumns = shownColumns;
        this.shownColumns.unshift('select')
      },
      (error)=>{
        console.log(error);
        this.toastr.error("Error in fetching User Previleges")
      }
    );
  }

  toggleTableView() {
    this.tableview = !this.tableview;
  }

  editColumns() {}

  editTableColumns() {
    const dialogRef = this.dialog.open(EditcolumnComponent, {
      data: {
        selectedcolumns: this.shownColumns,
        columns: this.accessibleColumns,
        orderedColumns: this.orderedColumns,
        currentUserViews:this.currentUserViews
      }
    });
    dialogRef.afterClosed().subscribe((data: []) => {
      if (data) {
        this.shownColumns = data;
        if(!this.shownColumns?.includes('select')) this.shownColumns?.unshift('select');
      }
    });
  }

  logSelection() {
    let unselectedItems = this.selection.selected;
    let totalSelectedLocs = this.selectedLocations.concat(this.selection?.selected);
    let arr = totalSelectedLocs.map((item: any) => {
      return item?.Route;
    })
    let uniqueSelectedLocations = Array.from(new Set(arr));
    let count_addedLocations = 0;
    if (this.selectedLocations.length == 0) this.initiatedRoute = false;
    this.locationService.setShowRoutes(false);
    if (uniqueSelectedLocations?.length > 1) {
      // Locations from Multiple Routes
      if (this.selectedLocations.length == 0) {
        unselectedItems.map((item: any, idx: any) => {
          if (item?.Location_ID == this.origin?.Location_ID && item?.Location_ID == this.destination?.Location_ID) {
            this.toastr.warning(`The Location ${item?.Location_Name} is either Origin or Destination`)
            unselectedItems.splice(idx, 1)
          }
        })
        if (this.firstChangefromMultipleRoutes) {
          const dialogRef = this.dialog.open(ConfirmBoxComponent, {
            data: {
              locations: `${this.selection?.selected?.length}`,
              destinationRoute: `${this.fetched_locations?.data[0]?.Route}`,
              isMultipleRoutes: true
            }
          });
          dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed == true) {
              this.selectedLocations.concat(unselectedItems);
              count_addedLocations = unselectedItems.length;
              this.addNewLocationstoList(unselectedItems, count_addedLocations);
            }
            else {
              this.locationService.clearSelectionModel();
              this.masterCheckbox = false;
              this.initiatedRoute = true;
            }
          });
        }
        else {
          this.selectedLocations.concat(unselectedItems);
          count_addedLocations = unselectedItems.length;
          this.addNewLocationstoList(unselectedItems, count_addedLocations);
        }

      }
      else {
        if (this.firstChangefromMultipleRoutes) {
          const dialogRef = this.dialog.open(ConfirmBoxComponent, {
            data: {
              locations: `${this.selection?.selected?.length}`,
              destinationRoute: `${this.fetched_locations?.data[0]?.Route}`,
              isMultipleRoutes: true
            }
          });
          dialogRef.afterClosed().subscribe(confirmed => {
            if (confirmed == true) {
              this.addLocationstoExistingfromMultipleRoutes(unselectedItems, count_addedLocations);
            }
            else {
              this.locationService.clearSelectionModel();
              this.masterCheckbox = false;
              this.initiatedRoute = true;
            }
          });
        }
        else this.addLocationstoExistingfromMultipleRoutes(unselectedItems, count_addedLocations);
      }
      this.firstChangefromMultipleRoutes = false;
      this.locationService.setIsFirstChangebyMutipleRts(false);
      // this.firstChangeAddMultipleRouteEvent.emit(this.firstChangefromMultipleRoutes)
    }
    else {
      this.selection.selected.forEach((s: any) => {
        if (s?.Route == '' || s?.Route == null || s?.Route == ' ' || s?.Route == undefined) this.toastr.warning(`The Locations have undefined Route and cannot be added to build the route `);
        else {
          if (s?.Location_ID != this.origin?.Location_ID && s?.Location_ID != this.destination?.Location_ID) {
            const index = this.selectedLocations.findIndex((object: any) => (object?.Location_ID === s?.Location_ID));
            if (index === -1) {
              if (this.selectedLocations.length > 0) {
                if (this.selectedLocations[0]?.Route == s?.Route) {
                  this.selectedLocations.push(s);
                  this.locationService.setSelectedPoints(this.selectedLocations);
                  count_addedLocations++;
                }
                else this.toastr.warning(`The Location (s) are part of a different Route`);
              }
              else {
                this.selectedLocations.push(s);
                this.locationService.setSelectedPoints(this.selectedLocations);
                count_addedLocations++;
              }
            }
            else this.toastr.warning(`Location ${s?.Location_Name} already exists in route`)
          }
          else this.toastr.warning(`The Location ${s?.Location_Name} is either Origin or Destination`)
        }
      });

      if (count_addedLocations == 1 && count_addedLocations > 0) ((this.initiatedRoute == true) ? this.toastr.success(`Added ${count_addedLocations} more location to Route`) : this.toastr.success(`Added ${count_addedLocations} location to Route`));
      else if (count_addedLocations > 1 && count_addedLocations > 0) ((this.initiatedRoute == true) ? this.toastr.success(`Added ${count_addedLocations} more locations to Route`) : this.toastr.success(`Added ${count_addedLocations} locations to Route`));
      this.locationService.clearSelectionModel();
      this.masterCheckbox = false;
      this.initiatedRoute = true;
    }

  }

  addNewLocationstoList(items: any, count_addedLocations: any) {
    this.locationService.setSelectedPoints(items);
    if (count_addedLocations == 1 && count_addedLocations > 0) ((this.initiatedRoute == true) ? this.toastr.success(`Added ${count_addedLocations} more location to Route`) : this.toastr.success(`Added ${count_addedLocations} location to Route`));
    else if (count_addedLocations > 1 && count_addedLocations > 0) ((this.initiatedRoute == true) ? this.toastr.success(`Added ${count_addedLocations} more locations to Route`) : this.toastr.success(`Added ${count_addedLocations} locations to Route`));
    this.locationService.clearSelectionModel();
    this.masterCheckbox = false;
    this.initiatedRoute = true;
  }
  addLocationstoExistingfromMultipleRoutes(items: any, count_addedLocations: any) {
    items.forEach((s: any) => {
      if (s?.Route == '' || s?.Route == null || s?.Route == ' ' || s?.Route == undefined) this.toastr.warning(`The Locations have undefined Route and cannot be added to build the route `);
      else {
        if (s?.Location_ID != this.origin?.Location_ID && s?.Location_ID != this.destination?.Location_ID) {
          const index = this.selectedLocations.findIndex((object: any) => (object?.Location_ID === s?.Location_ID));
          if (index === -1) {
            if (this.selectedLocations.length > 0) {
              this.selectedLocations.push(s);
              this.locationService.setSelectedPoints(this.selectedLocations);
              count_addedLocations++;

            }
            else {
              this.selectedLocations.push(s);
              this.locationService.setSelectedPoints(this.selectedLocations);
              count_addedLocations++;
            }
          }
          else this.toastr.warning(`Location ${s?.Location_Name} already exists in route`)
        }
        else this.toastr.warning(`The Location ${s?.Location_Name} is either Origin or Destination`)
      }
    });

    if (count_addedLocations == 1 && count_addedLocations > 0) ((this.initiatedRoute == true) ? this.toastr.success(`Added ${count_addedLocations} more location to Route`) : this.toastr.success(`Added ${count_addedLocations} location to Route`));
    else if (count_addedLocations > 1 && count_addedLocations > 0) ((this.initiatedRoute == true) ? this.toastr.success(`Added ${count_addedLocations} more locations to Route`) : this.toastr.success(`Added ${count_addedLocations} locations to Route`));
    this.locationService.clearSelectionModel();
    this.masterCheckbox = false;
    this.initiatedRoute = true;

  }


  selectRows() {
    let endIndex: number;
    if (this.dataSource.paginator) {
      if (this.dataSource.filter.length > (this.dataSource.paginator.pageIndex + 1) * this.dataSource.paginator.pageSize) {
        endIndex = (this.dataSource.paginator.pageIndex + 1) * this.dataSource.paginator.pageSize;
      } else {
        endIndex = this.dataSource.filter.length;
      }

      for (let index = (this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize); index < endIndex; index++) {
        // this.selection.select(this.dataSource.data[index]);
        this.locationService.select(this.dataSource.data[index]);
      }
    }
  }

  getPageData() {
    return this.dataSource._pageData(this.dataSource._orderData(this.dataSource.filteredData));
  }

  isEntirePageSelected() {
    return this.getPageData().every((row: any) => this.selection.isSelected(row));
  }

  masterToggle(checkboxChange: MatCheckboxChange) {
    this.isEntirePageSelected() ?
      this.selection.deselect(...this.getPageData()) :
      this.selection.select(...this.getPageData());
  }

  checkboxLabel(row: any): string {
    if (!row) {
      return `${this.isEntirePageSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }

  deSelectRows() {
    let endIndex: number;
    if (this.dataSource.paginator) {
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
    if (this.dataSource.paginator) {
      if (this.dataSource.data.length > (this.dataSource?.paginator?.pageIndex + 1) * this.dataSource.paginator.pageSize) {
        endIndex = (this.dataSource.paginator.pageIndex + 1) * this.dataSource.paginator.pageSize;
      } else {
        endIndex = this.dataSource.data.length - (this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize);
      }
      this.masterCheckbox = numSelected === endIndex;
      return this.masterCheckbox;
    }
    else return false;
  }

  selectaRow(row: any, ev: any) {
    // if(ev?.checked) this.selection.select(row);
    // else this.selection.deselect(row);
    if (ev?.checked) this.locationService.select(row);
    else this.locationService.deselect(row);
  }

  applyFilter(filterValue: any, column: any) {
    this.selection.deselect(...this.getPageData())  // needs to clear the checked locations before filtering
    if (filterValue.target?.value == '') {
      this.isFilterActive = false;
      this.filteredColumns.map((item: any, idx: any) => {
        if (item == column) this.filteredColumns.splice(idx, 1)
      });
      this.clearAllFilters();
      this.locationService.clearSelectionModel();
    }
    else {
      if (column == 'Location_Name') {
        this.enabledRouteFilter = false;
        this.enabledAddressLine1Filter = false;
        this.enabledLocationNameFilter = true;
      }
      if (column == 'Route') {
        this.enabledLocationNameFilter = false;
        this.enabledAddressLine1Filter = false;
        this.enabledRouteFilter = true;
      }
      if (column == 'Address_Line_1') {
        this.enabledLocationNameFilter = false;
        this.enabledRouteFilter = false;
        this.enabledAddressLine1Filter = true;
      }

      this.isFilterActive = true;
      this.filteredColumns.push(column);
      this.dataSource.filterPredicate = function (data: any, filter: string): any {
        if (column == 'Route') return data?.Route?.toLowerCase().includes(filter);
        else if (column == 'Address_Line_1') return data?.Address_Line_1?.toLowerCase().includes(filter);
        else if (column == 'Location_Name') return data?.Location_Name?.toLowerCase().includes(filter);
        else if (column == 'On_Route') return data?.On_Route == filterValue;
      };
      if (filterValue?.target?.value) filterValue = filterValue.target?.value?.trim().toLowerCase();
      else filterValue = filterValue;
      this.dataSource.filter = filterValue;
      this.cdr.detectChanges();
    }
  }

  clearAllFilters() {
    this.applyFilter('', '');
    this.enabledRouteFilter = true;
    this.enabledLocationNameFilter = true;
    this.enabledAddressLine1Filter = true;
    if (this.filterName?.nativeElement) this.filterName.nativeElement.value = '';
    if (this.filterAddress?.nativeElement) this.filterAddress.nativeElement.value = '';
    if (this.filterRouteName?.nativeElement) this.filterRouteName.nativeElement.value = '';
    if (this.filterAddressLine1?.nativeElement) this.filterAddressLine1.nativeElement.value = '';
    if (this.filterOnRoute?.value) this.filterOnRoute.value = '';
    this.isFilterActive = false;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }


  onChangedPage(event: any) {
    this.pageSizeperPage = event?.pageSize;
    this.masterCheckbox = false;
    if (this.selection.selected.length > 0) {
      const dialogRef = this.dialog.open(ConfirmBoxComponent, {
        data: {
          locations: `${this.selection?.selected?.length}`,
          destinationRoute: `${this.fetched_locations?.data[0]?.Route}`,
        }
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed == true) {
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
