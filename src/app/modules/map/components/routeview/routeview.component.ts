import { ToastrServices } from 'src/app/services/toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmBoxComponent } from '../confirm-box/confirm-box.component';
import MarkerClusterer from '@googlemaps/markerclustererplus';
import * as moment from 'moment';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip';
import { ApiService } from 'src/app/services/api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocationService } from '../../../../services/location.service';
import { environment } from 'src/environments/environment';
import { animate, animation, style, transition, trigger, useAnimation, state, keyframes } from '@angular/animations';
import { ChangeDetectionStrategy, Component, ElementRef, OnChanges, OnInit, Input, Output, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter, ViewEncapsulation, SimpleChanges, HostListener, OnDestroy } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { DrawingService } from '../../../../services/drawing.service';
import { NewterritoryformComponent } from '../newterritoryform/newterritoryform.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { debounceTime } from 'rxjs';

interface ViewObj {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-routeview',
  templateUrl: './routeview.component.html',
  styleUrls: ['./routeview.component.css'],
  animations: [
    trigger('navigation', [
      state('false', style({ right: '0%' })),
      state('true', style({ right: '-22%' })),
      transition('0 => 1', animate('.24s')),
      transition('1 => 0', animate('.24s'))
    ]),
    trigger('drawingmode', [
      state('false', style({ right: '0%' })),
      state('true', style({ right: '-44%' })),
      transition('0 => 1', animate('.24s')),
      transition('1 => 0', animate('.24s'))
    ])

  ]
})
export class RouteviewComponent implements OnInit, OnChanges, OnDestroy {
  navigation: boolean = false;
  showOverlay: boolean = false;
  showRoutes: boolean = false;
  selectedLocations: any = [];
  isHomesetasCurrent: boolean = false;
  isHomesetasDefault: boolean = true;
  isHomesetasFavourite: boolean = false;
  isHomesetasEditedLocation: boolean = false;
  isEndsetasCurrent: boolean = false;
  isEndsetasDefault: boolean = true;
  isEndsetasFavourite: boolean = false;
  isEndsetasEditedLocation: boolean = false;
  options: any = {
    componentRestrictions: {
      country: ["CA"]
    }
  };
  labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[4]);
  mkrs: any = [];
  shortestRte: google.maps.DirectionsRoute | any;
  directionsService: any;
  directionsRenderer: any;
  showSliderMenu: boolean = false;
  result: any;
  rightanimationActive: boolean = false;
  leftanimationActive: boolean = false;
  totalDistance: any;
  totalDuration: any;
  infoWin: any;
  wayPoints: any = [];
  shortestResult: google.maps.DirectionsResult | any;
  pinSideMenu: boolean = false;
  displayDate: any;
  currentDate: any;
  displayTime: any;
  currentTime: any;
  isOpen: any;
  originMkr: any;
  destMkr: any;
  startstopmkr: any;
  selection = new SelectionModel<any>(true, []);
  data: any;
  rendererArray: any = [];
  csvData: any;
  selectedPoints: any;
  minTime: any;
  @Input('fetched_locations') fetched_locations: any;
  @Input('origin') origin: any;
  @Input('destination') destination: any;
  @Input('map') map: any;
  @Input('allTerritoriesLoaded') allTerritoriesLoaded: any;
  @Input('polygonsatDb') polygonsatDb: any;
  @Input('fetchedZones') fetchedZones: any;
  @Input('initialLoaderZones') initialLoaderMaps: any;
  // @Input('firstChangeFromMultipleRtes') firstChangeFromMultipleRtes: any;
  @ViewChild('timepicker') timepicker: any;
  @ViewChild('searchedLoc') searchedLoc: any;
  initialLoader: boolean = false;
  wypntMarkers: any;
  routesModeView: boolean = true;
  zonesModeView: boolean = false;
  viewObjects: ViewObj[] = [
    { value: 'routesview', viewValue: 'Routes' },
    { value: 'zonesview', viewValue: 'Territories' },
  ];
  selectedViewMode = this.viewObjects[0].value;
  enableDrawingMode: boolean = false;
  selectedTerritories: any = [];
  length: number = 0;
  pageSize: number = 5;
  pageSizeOptions: number[] = [3, 6, 5, 9, 10, 12, 26];
  start: any;
  end: any;
  newTerritoryData: any;
  checkedZonesList: any = [];
  previousPolygonsatDB: any = [];
  disableTerritoriesViewMode: boolean = false;
  fetchTimeInterval: any;
  currentTimeUTC: any;
  displayTimeUTC: any;
  zoneSelectionModel_: any = new SelectionModel<any>(true, []);;
  dataSource_: any;
  pageSizeperPage_: any;
  displayedColumns_: any;
  masterCheckbox_: any;
  private paginator_: MatPaginator | any;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator_ = mp;
    this.setDataSourceAttributes()
  }
  filteredColumns_: any = [];
  isFilterActive_: boolean = false;
  enableZoneFilter_: boolean = false;
  @ViewChild('filterZoneName') filterZoneName_: any;
  pgIndex_: any = 0;
  isBuildingRoute: boolean = false;
  filteredLocOptions: any;
  formGroup!: FormGroup;
  firstChangeFromMultipleRtes: boolean = true;
  Searchservice: any = new google.maps.places.AutocompleteService();
  googleLocationSuggestions: any = [];
  currentUserViews:any;
  user_restricted_columns:any;

  @Output('clearClusters') clearClusters = new EventEmitter();
  @Output('addClusters') addClusters = new EventEmitter();
  @Output('enableInitialLoader') enableInitialLoader = new EventEmitter();
  @Output('disableInitialLoader') disableInitialLoader = new EventEmitter();
  @Output('showBuildRoute') showBuildRoute = new EventEmitter();
  @Output('initZoneCreation') initZoneCreation = new EventEmitter();
  @Output('showZones') showZones = new EventEmitter();
  @Output('hideZones') hideZones = new EventEmitter();
  @Output('jumpPolygonEvent') jumpPolygonEvent = new EventEmitter();
  @Output('viewSinglePolygon') viewSinglePolygon = new EventEmitter();
  @Output('hideSinglePolygon') hideSinglePolygon = new EventEmitter();
  @Output('deleteZoneEvent') deleteZoneEvent = new EventEmitter();
  @Output('editZoneEvent') editZoneEvent = new EventEmitter();
  @Output('viewSinglePolygonWithoutBounds') viewSinglePolygonWithoutBounds = new EventEmitter();
  @Output('hideTempMarkers') hideTempMarkers = new EventEmitter();

  constructor(private locationService: LocationService, private fb: FormBuilder, private cdr: ChangeDetectorRef, private drawingService: DrawingService, private dialog: MatDialog, private toastr: ToastrServices, private apiService: ApiService, private http: HttpClient) { }

  ngOnInit(): void {
    this.initForm();
    this.pageSizeperPage_ = 5;
    this.routesModeView = true;
    this.zonesModeView = false;
    this.start = 0;
    this.end = 5;
    this.directionsService = new google.maps.DirectionsService();
    this.infoWin = new google.maps.InfoWindow();
    this.locationService.getSelectedPoints().subscribe((item: any) => {
      this.selectedLocations = item;
    });

    this.locationService.getShowRoutes().subscribe((item: any) => {
      this.showRoutes = item;
    })
    this.locationService.getIsFirstChangebyMutipleRts().subscribe((item: any) => {
      this.firstChangeFromMultipleRtes = item;
    })
    this.drawingService.getDrawMode().subscribe((item: any) => {
      this.enableDrawingMode = item;

    });

    this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map, suppressMarkers: true });
    this.currentDate = new Date();
    this.currentTime = this.formatAMPM(new Date());
    this.currentTimeUTC = new Date().getTime();
    this.displayTime = this.formatAMPM(new Date());
    this.displayDate = new Date();
    this.initMap();
    this.assignUserPrevileges();
    this.makeClusters();
  }



  initForm() {
    this.formGroup = this.fb.group({
      'sLocations': ['']
    });
    let googlesuggestions: any = [];
    this.formGroup.get('sLocations')?.valueChanges
      .pipe(debounceTime(10))
      .subscribe((response: any) => {
        if (response && response?.length) {
          this.Searchservice.getPlacePredictions({
            input: response,
            componentRestrictions: { country: 'CA' }
          }, (predictions: any, status: any) => {
            if (status != google.maps.places.PlacesServiceStatus.OK) {
              console.warn(status);
              return;
            }
            googlesuggestions = predictions;
            this.googleLocationSuggestions = predictions;
          });
        } else {
          this.filteredLocOptions = [];
        }
        this.filterLocationList(response, this.googleLocationSuggestions);
      })
  }


  filterLocationList(enteredData: any, googlesuggestions: any[]) {
    let suggestions: any = [];
    if (enteredData) {
      this.filteredLocOptions = this.fetched_locations?.data?.filter((item: any) => {
        return item?.Address_Line_1?.toLowerCase().indexOf(enteredData.toLowerCase()) > -1;
      });

    }
    googlesuggestions.map((item: any, idx: any) => {
      let obj = {
        Address: item?.description,
        Address_Line_1: item?.description,
        Flag: 1,
        Latitude: 0,
        Location_ID: 0,
        Location_Name: item?.description,
        Location_Number: "0",
        Longitude: 0,
        Route: 0,
        Route_ID: 0
      }
      suggestions.push(obj);
    });
    this.filteredLocOptions = this.filteredLocOptions.concat(suggestions);
  }

  addSearchedLocationtoRoute(item: any) {
    this.searchedLoc.nativeElement.value = "";
    this.formGroup.reset();
    let isduplicateExists = false;
    let isMultipleRouteExists = false;
    if (item?.Flag == 1) {
      this.findLatLngByGeocoder(item?.Address, item);
      this.searchedLoc.nativeElement.value = "";
      return;
    }
    for (let i = 0; i < this.selectedLocations.length; i++) {
      if (item?.Location_ID == this.selectedLocations[i]?.Location_ID) {
        isduplicateExists = true;
        break;
      }
      else isduplicateExists = false;
    };
    for (let i = 0; i < this.selectedLocations.length; i++) {
      if (item?.Route != this.selectedLocations[i]?.Route) {
        isMultipleRouteExists = true;
        break;
      }
      else isMultipleRouteExists = false;
    };
    if (!isduplicateExists) {
      if (this.firstChangeFromMultipleRtes && this.selectedLocations.length > 0 && isMultipleRouteExists) {
        const dialogRef = this.dialog.open(ConfirmBoxComponent, {
          data: {
            locations: `${1}`,
            destinationRoute: `${this.fetched_locations?.data[0]?.Route}`,
            isMultipleRoutes: true
          }
        });
        dialogRef.afterClosed().subscribe(confirmed => {
          if (confirmed == true) {
            this.addLocationsByMultipleRoutes(item)

          }
        });
        this.firstChangeFromMultipleRtes = false;
        this.locationService.setIsFirstChangebyMutipleRts(false);
      }
      else {
        this.selectedLocations.push(item);
        this.locationService.setSelectedPoints(this.selectedLocations);
        if (this.selectedLocations.length > 1) this.toastr.success("Added 1 more Location to Route");
        else this.toastr.success("Added 1 Location to Route");
      }
    }
    else this.toastr.warning("The Location already exists in the Route");

  }

  findLatLngByGeocoder(formatted_address: any, random_loc: any) {
    const geocoder = new google.maps.Geocoder();
    let LatLng: any;
    LatLng = geocoder.geocode(
      {
        address: formatted_address
      },
      (results: any, status: any): any => {
        if (status === "OK" && results.length > 0) {
          const firstResult = results[0].geometry;
          let pos = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() };
          random_loc.Latitude = pos?.lat;
          random_loc.Longitude = pos?.lng;
          this.addLocationsByMultipleRoutes(random_loc);
        }
        else if (status != "OK") {
          this.toastr.error('Could not fetch the Location');

        }
      }
    );
    this.searchedLoc.nativeElement.value = "";
  }

  addLocationsByMultipleRoutes(items: any) {
    this.selectedLocations.push(items);
    this.locationService.setSelectedPoints(this.selectedLocations);
    if (this.selectedLocations.length > 1) this.toastr.success("Added 1 more Location to Route");
    else this.toastr.success("Added 1 Location to Route");
  }

  ngOnChanges(changes: SimpleChanges) {
    this.displayedColumns_ = ['select', 'name'];
    this.selection = this.locationService.getSelectionModel();
    if (changes['polygonsatDb']) {
      this.savedCheckedZonesList();
      if (this.previousPolygonsatDB.length > 0) this.addNewZonetoCheckList();
      this.previousPolygonsatDB = [...this.polygonsatDb];
      this.dataSource_ = new MatTableDataSource<any>(this.polygonsatDb);
    }
    if (changes['initialLoaderZones']) this.clearAllFilters();
  }

  setDataSourceAttributes() {
    this.dataSource_.paginator = this.paginator_;
    if (this.paginator_) {
      this.applyFilter('', '');
    }
  }

  applyFilter(filterValue: any, column: any) {
    // this.selection_.deselect(...this.getPageData())  // needs to clear the checked locations before filtering
    if (filterValue.target?.value == '') {
      this.isFilterActive_ = false;
      this.filteredColumns_.map((item: any, idx: any) => {
        if (item == column) this.filteredColumns_.splice(idx, 1)
      });
      this.clearAllFilters();
      // this.zoneService.clearSelectionModel();
    }
    else {
      if (column == 'name') this.enableZoneFilter_ = true;
      this.isFilterActive_ = true;
      this.filteredColumns_.push(column);
      this.dataSource_.filterPredicate = function (data: any, filter: string): any {
        if (column == 'name') return data?.name?.toLowerCase().includes(filter);
      };
      if (filterValue?.target?.value) filterValue = filterValue.target?.value?.trim().toLowerCase();
      else filterValue = filterValue;
      this.dataSource_.filter = filterValue;
      this.cdr.detectChanges();
    }
  }

  clearAllFilters() {
    this.applyFilter('', '');
    this.enableZoneFilter_ = true;
    if (this.filterZoneName_?.nativeElement) this.filterZoneName_.nativeElement.value = '';
    this.isFilterActive_ = false;
  }

  onChangedPage(event: any) {
    this.pageSizeperPage_ = event?.pageSize;
    // this.masterCheckbox_ = false;
  }

  navigationDrawer() {
    this.navigation = !this.navigation;
    this.showOverlay = !this.showOverlay;
  }

  openTimePicker(): any {
    this.timepicker.open();
  }

  deleteWaypoint(loc: any) {
    this.selectedLocations.map((item: any, idx: any) => {
      if (loc.Location_ID == item.Location_ID) this.selectedLocations.splice(idx, 1);
    });
    this.locationService.setSelectedPoints(this.selectedLocations);
    this.locationService.clearSelectionModel();
  }

  deleteAllWaypoints() {
    const dialogRef = this.dialog.open(ConfirmBoxComponent, {
      data: {
        locations: `${this.selectedLocations?.length}`,
        destinationRoute: null,
        clearRoute: true
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed == true) {
        this.showRoutes = false;
        this.disableTerritoriesViewMode = false;
        this.showBuildRoute.emit(this.showRoutes);
        this.selectedLocations = [];
        this.locationService.setSelectedPoints([]);
        this.locationService.clearSelectionModel();
        this.clearClusters.emit();
        this.addClusters.emit();
        this.clearWaypointMkrs();
        this.removeRoute();
        this.clearOriginDestinationMkrs();
        this.locationService.setIsFirstChangebyMutipleRts(true);

      }
      else this.locationService.clearSelectionModel();
    });
  }

  clearAllWaypoints() {
    if (this.selectedLocations.length > 0 || (this.wypntMarkers && this.wypntMarkers.length > 0)) {
      const dialogRef = this.dialog.open(ConfirmBoxComponent, {
        data: {
          locations: `${this.selectedLocations?.length}`,
          destinationRoute: null,
          clearRoute: false,
          isExistingRoute: (this.wypntMarkers && this.wypntMarkers.length > 0) ? true : false
        }
      });
      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed == true) {
          this.showRoutes = false;
          this.disableTerritoriesViewMode = false;
          this.showBuildRoute.emit(this.showRoutes);
          this.selectedLocations = [];
          this.locationService.setSelectedPoints([]);
          this.clearClusters.emit();
          this.addClusters.emit();
          this.clearWaypointMkrs();
          this.clearOriginDestinationMkrs();
          this.removeRoute();
          this.locationService.clearSelectionModel();
          this.locationService.setIsFirstChangebyMutipleRts(true);

        }
        else this.locationService.clearSelectionModel();
      });
    }
  }

  removeRoute() {
    this.rendererArray?.map((renderer: any) => {
      renderer?.setOptions({
        suppressPolylines: true
      });
      renderer?.setMap(null);
    });
    this.locationService.setBuiltRouteExists(false);
  };

  editRoute() {
    this.showRoutes = !this.showRoutes;
    this.disableTerritoriesViewMode = true;
    this.showBuildRoute.emit(this.showRoutes);
  }

  downloadCSV() {
    if (this.csvData.length > 0) {
      let rows: any = [];
      this.csvData = this.csvData.filter((item: any, idx: any) => {
        if (idx != 0 && idx != this.csvData.length - 1) return item;
      })
      this.csvData.map((item: any, idx: any) => {
        let values = Object.values(item);
        values = values.map((value: any, index) => {
          return String(value).replace('#', '').split(',')[0];
        });
        rows.push(values)
      })
      rows.map((item: any, idx: any) => {
        item[0] = item[0].replace(/,/g, '')
      })
      let keys = Object.keys(this.csvData?.[0]);
      keys = keys.map((key, index) => {
        return key.replace(/_/g, ' ');
      });
      rows.unshift([`${String(this.data?.Route?.[1]?.Route).split(',')[0]}`, " ", " ", " ", " ", "Amount"]);
      rows.unshift([" ", " ", "This Run Has Readings"]);
      rows.unshift([" ", " ", " ", "User"]);
      let dat = new Date();
      let day = dat?.getDate();
      let mnth = dat?.toLocaleString('default', { month: 'long' });
      let weekday = dat?.toLocaleString('default', { weekday: 'long' });
      let dispDate = `${weekday} ${mnth} ${day}`;
      rows.unshift([" ", " ", " ", " ", " ", `${dispDate}`]);
      let csvContent = "data:text/csv;charset=utf-8,";
      rows.push(["K_____________", "C______________", " ", "S_____________"]);
      rows.push([" ", " ", " "]);
      rows.push(["Authorized PersonnelX____________________________", "CollectorX____________________________"])
      rows.forEach(function (rowArray: any) {
        let row = rowArray.join(",");
        csvContent += row + "\r\n";
      });
      var encodedUri = encodeURI(csvContent);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      var today: any = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      today = mm + '-' + dd + '-' + yyyy;
      link.setAttribute("download", `${(this.data?.Route?.[1]?.Route) ? this.data?.Route?.[1]?.Route : this.csvData?.[1]?.Route}-${today}.csv`);
      document.body.appendChild(link); // Required for FF
      link.click();
    }
    else this.toastr.warning("There are no selected Locations for current Route");

  }

  findOcc(arr: any, key: any) {
    let arr2: any = [];
    arr.forEach((x: any) => {
      if (arr2.some((val: any) => { return val[key] == x[key] })) {
        arr2.forEach((k: any) => {
          if (k[key] === x[key]) k["occurrence"]++
        })
      } else {
        let a: any = {}
        a[key] = x[key]
        a["occurrence"] = 1
        arr2.push(a);
      }
    })
    return arr2
  }

  leftDateClick(): void {
    const numOfDays = 1;
    const daysAgo = new Date(this.displayDate.getTime());
    daysAgo.setDate(this.displayDate.getDate() - numOfDays);
    this.dateChange(daysAgo);
  }


  rightDateClick(): void {
    const numOfDays = 1;
    const daysAgo = new Date(this.displayDate.getTime());
    daysAgo.setDate(this.displayDate.getDate() + numOfDays);
    this.dateChange(daysAgo);
  }

  setHomeasCurrentLoc() {
    this.isHomesetasCurrent = true;
    this.isHomesetasDefault = false;
    this.isHomesetasEditedLocation = false;
    this.isHomesetasFavourite = false;
    this.startstopmkr = [];
    this.origin = "St. Loius";
  }

  setEndasCurrentLoc() {
    this.isEndsetasCurrent = true;
    this.isEndsetasDefault = false;
    this.isEndsetasEditedLocation = false;
    this.isEndsetasFavourite = false;
    this.startstopmkr = [];
    this.destination = "Edmonton";
  }

  formatAMPM(date: any) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    let strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  getformatted24hrs() {
    let date = new Date();
    let hours: any = date.getHours();
    let minutes: any = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours < 10 ? ('0' + hours) : hours;
    minutes = minutes < 10 ? ('0' + minutes) : minutes;
    let strTime = hours + ':' + minutes;
    return strTime;
  }

  timeFromMins(mins: any) {
    function z(n: any) { return (n < 10 ? '0' : '') + n; }
    var h = (mins / 60 | 0) % 24;
    var m = mins % 60;
    return z(h.toFixed(2)) + ':' + z(m.toFixed(2));
  }

  addbyMoment(secs: any) {
    const number = moment(this.displayTime, ["hh:mm A"]).add(secs, 'seconds').format("h:mm A");
    return number;
  }

  compareDates(d1: Date, d2: Date) {
    let date1 = new Date(d1).getDate();
    let date2 = new Date(d2).getDate();
    let month1 = new Date(d1).getMonth();
    let month2 = new Date(d2).getMonth();
    let year1 = new Date(d1).getFullYear();
    let year2 = new Date(d2).getFullYear();
    this.currentTime = this.formatAMPM(new Date());
    if (date1 < date2 || month1 < month2 || year1 < year2) this.minTime = '0:00'
    else if (date1 > date2 || month1 > month2 || year1 > year2) this.minTime = '0:00'
    else {
      this.displayTime = this.currentTime;
      this.minTime = this.currentTime;
    }
  };

  dateChange(event: any): void {
    let date = event.value || event;
    this.displayDate = date;
    this.currentTime = this.formatAMPM(new Date());
    this.currentDate = new Date();
    this.compareDates(this.displayDate, this.currentDate)
    const yyyy = date.getFullYear();
    let mm: any = date.getMonth() + 1;
    let dd: any = date.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const formattedDate = { "date": mm + '-' + dd + '-' + yyyy };
  }

  onTimeset(ev: any) {
    let time = ev?.value || ev;
    this.displayTime = time;
  }

  initMap() {
    // inactive fn
    this.fetched_locations?.data?.map((location: any) => {
      if (location?.Location_ID !== this.origin?.Location_ID && location?.Location_ID != this.destination?.Location_ID) this.makemkrs({ lat: parseFloat(location?.Latitude), lng: parseFloat(location?.Longitude) }, location?.Location_Name, parseFloat(location?.Location_ID), location?.Route)
    });
    this.initialLoader = false;
  }

  makeClusters() {
    // inactive fn
    var mkrClusters = new MarkerClusterer(this.map, this.mkrs, {
      imagePath:
        "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
    });
  }

  makeMarker(position: any, icon: any, address: any, route: any, loc_id: any,item:any) {
    let label = address + "";
    let obj = { lat: parseFloat(position.lat), lng: parseFloat(position.lng) };
    if (icon == "start") {
      this.originMkr = new google.maps.Marker({
        position: obj,
        map: this.map,
        icon: "assets/flag-start.png",
        // label: { text: label, color: "#1440de", fontSize: "11px", fontWeight: '600', className: 'marker-position' },
        title: label
      });
      google.maps.event.addListener(this.originMkr, 'click', (evt: any) => {
        this.infoWin.setContent(`<div class="grid-container-mkr" style="padding:10px;display: grid;grid-template-columns: auto auto;gap: 10px;padding: 10px;font-weight:400">
        ${this.renderInfoDetailsasHTMLforEndPoints(item)}
      </div>`);
        this.infoWin.open(this.map, this.originMkr);
      });
      this.originMkr?.setMap(this.map)
      this.startstopmkr?.push(this.originMkr);
    }
    else {
      this.destMkr = new google.maps.Marker({
        position: obj,
        map: this.map,
        icon: "assets/flag-end.png",
        // label:{text:title,color: "#1440de",fontSize: "11px",fontWeight:'600',className:'marker-position'},
        title: label
      });

      google.maps.event.addListener(this.destMkr, 'click', (evt: any) => {
        this.infoWin.setContent(`<div class="grid-container-mkr" style="padding:10px;display: grid;grid-template-columns: auto auto;gap: 10px;padding: 10px;font-weight:400">
        ${this.renderInfoDetailsasHTMLforEndPoints(item)}
      </div>`);
        this.infoWin.open(this.map, this.destMkr);
      })
      this.destMkr?.setMap(this.map);
      this.startstopmkr?.push(this.destMkr);
    }
  }

  makemkrs(position: any, title: any, loc_id: any, route_name: any) {
    // inactive fn
    // let label = title + "";
    // let markerIcon = {
    //   url: 'assets/pin.png',
    //   scaledSize: new google.maps.Size(30, 30),
    //   labelOrigin: new google.maps.Point(-30, 10),
    // };
    // let obj = position;
    // let marker = new google.maps.Marker({
    //   position: obj,
    //   map: this.map,
    //   icon: markerIcon,
    //   label: { text: label, color: "#1440de", fontSize: "11px", fontWeight: '600', className: 'marker-position' },
    // });
    // google.maps.event.addListener(marker, 'click', (evt: any) => {
    //   this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${loc_id}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${title} </p> 
    //   <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>
    // </div>`);
    //   this.infoWin.open(this.map, marker);
    // })
    // this.mkrs.push(marker);
  }

  makeWaypointMarkersbyLatLng(position: any, Address: any, Route_Name: any, i: any, Location_ID: any, washers: any, dryers: any,item:any) {
    let label = i + "";
    let obj = { lat: position?.lat, lng: position?.lng };
    washers = (washers === null) ? 0 : washers;
    dryers = (dryers === null) ? 0 : dryers;
    var waypoint = new google.maps.Marker({
      position: obj,
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillOpacity: 1,
        strokeWeight: 3,
        fillColor: '#3b6edb',
        strokeColor: '#9db6ed',
      },
      label: { text: label, color: "#ffffff", fontSize: "16px", fontWeight: '600' },
      title: label
    });
    google.maps.event.addListener(waypoint, 'click', (evt: any) => {
      this.infoWin.setContent(`<div class="grid-container-mkr" style="padding:10px;display: grid;grid-template-columns: auto auto;gap: 10px;padding: 10px;font-weight:400">
                                ${this.renderInfoDetailsasHTML(item)}
                              </div>`
      );
      this.infoWin.open(this.map, waypoint);
    });

    waypoint.setMap(this.map)
    this.wypntMarkers?.push(waypoint);
  }

  makeWaypointMarkers(position: any, Address: any, Route_Name: any, i: any, Location_ID: any, washers: any, dryers: any,item:any) {
    let label = i + "";
    let pos;
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': Address }, (results: any, status: any) => {
      if (status == 'OK') {
        pos = results[0].geometry.location;
        let obj = { lat: pos.lat(), lng: pos.lng() };
        washers = (washers === null) ? 0 : washers;
        dryers = (dryers === null) ? 0 : dryers;
        var waypoint = new google.maps.Marker({
          position: obj,
          map: this.map,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 14,
            fillOpacity: 1,
            strokeWeight: 3,
            fillColor: '#3b6edb',
            strokeColor: '#9db6ed',
          },
          label: { text: label, color: "#ffffff", fontSize: "16px", fontWeight: '600' },
          title: label
        });
        google.maps.event.addListener(waypoint, 'click', (evt: any) => {
          this.infoWin.setContent(`<div class="grid-container-mkr" style="padding:10px;display: grid;grid-template-columns: auto auto;gap: 10px;padding: 10px;font-weight:400">
                                    ${this.renderInfoDetailsasHTML(item)}
                                  </div>`
          );
          this.infoWin.open(this.map, waypoint);
        });
        waypoint.setMap(this.map)
        this.wypntMarkers?.push(waypoint);
      } else console.warn("Geocoder was not successful")
    });
  }

  renderInfoDetailsasHTML(location:any){
    let popup_infoString = this.currentUserViews?.[0]?.location_popup_info;
    let popup_columns = popup_infoString?.substring(1, popup_infoString?.length-1).split(" ");
    return `${(function fun() {
      let tot = '';
      for(let i=0;i<popup_columns.length;i++){
        for (const [key, value] of Object.entries(location)) {
         if(popup_columns[i] == key){
           tot= tot + `<div>${key.replace(/_/," ")} :</div><div>${(value)? value : '<i>Empty</i>'}</div>`;
         }
        }
      }
      return tot;
    })()}`;
  }

  renderInfoDetailsasHTMLforEndPoints(location:any){
    let popup_infoString = this.currentUserViews?.[0]?.location_popup_info;
    let popup_columns = popup_infoString.substring(1, popup_infoString.length-1).split(" ");
    return `${(function fun() {
      let tot = '';
      for(let i=0;i<popup_columns.length;i++){
        for (const [key, value] of Object.entries(location)) {
         if(popup_columns[i] == key){
           if(key != 'Address') tot= tot + `<div>${key.replace(/_/," ")} :</div><div>${(value)? value : '<i>Empty</i>'}</div>`;
         }
         else if(popup_columns[i]=='Address') {
          tot = tot + `<div>Address :</div><div>${(location?.Address_Line_1) ? location?.Address_Line_1 : ''} ${(location?.Address_Line_2) ? location?.Address_Line_2 : ''}, ${(location?.City) ? location?.City : ''}, ${location?.Country ? location?.Country : ''}</div>`;
          break;
         }
        }
      }
      return tot;
    })()}`;
  }

  clearWaypointMkrs() {
    for (var i = 0; i < this.wypntMarkers?.length; i++) {
      this.wypntMarkers[i].setMap(null);
    }
    this.wypntMarkers = [];
  }

  clearOriginDestinationMkrs() {
    for (var i = 0; i < this.startstopmkr?.length; i++) {
      this.startstopmkr[i].setMap(null);
    }
    this.startstopmkr = [];

  }

  omit(obj: any, arr: any) {
    return Object.keys(obj)
      .filter(k => !arr.includes(k))
      .reduce((acc: any, key: any) => ((acc[key] = obj[key]), acc), {});

  }

  buildRoute() {
    if (this.selectedLocations.length > 0) {
      this.hideTempMarkers.emit();
      this.clearWaypointMkrs();
      this.clearOriginDestinationMkrs();
      // this.clearClusters.emit();
      this.enableInitialLoader.emit();
      this.isBuildingRoute = true;
      this.selectedPoints = [...this.selectedLocations]
      this.selectedPoints.unshift(this.origin);
      let isRandomLocationExists: any = false;
      this.selectedPoints.map((item: any, idx: any) => {
        if (item?.Flag) {
          item.Location_ID = - (idx + 1);
          isRandomLocationExists = true;
        }
      });
      let endPoint = (isRandomLocationExists) ? 'random_route' : 'build_route';
      this.apiService.post(`${environment?.coreApiUrl}/${endPoint}`, this.selectedPoints).subscribe(data => {
        if (data) {
          this.data = data;
          this.clearClusters.emit();
          this.computeTotalDistance(data);
          this.csvData = [...data?.Route];
          this.csvData = this.csvData.map((item: any, idx: any) => {
            item = this.omit(item, ['Route_ID', 'Location_Name', 'Latitude', 'Longitude', 'Dryers', 'Washers']);
            let item_ = {
              Address: String(item?.Address).split(',')[0],
              City: item?.City,
              Route: (item?.Route) ? String(item?.Route).split('-')[0] : '',
              Location_ID: item?.Location_ID,
              Coin_Card_Location: item?.Coin_Card_Location
            }
            return item_;
          }
          );
          this.data?.Route.map((item: any, idx: any) => {
            item["distance_text"] = this.data?.Route_Details[idx]?.Distance_Text;
            item["distance_value"] = this.data?.Route_Details[idx]?.Distance_Value;
            item["duration_text"] = this.data?.Route_Details[idx]?.Duration_Text;
            item["duration_value"] = this.data?.Route_Details[idx]?.Duration_Value;
            if (idx != 0) {
              item.cummulativeWithNoInterval = this.data?.Route[idx - 1].cummulative + this.data?.Route_Details[idx - 1]?.Duration_Value;
              item.cummulative = item?.cummulativeWithNoInterval + 1800;
            }
            else {
              item.cummulativeWithNoInterval = 0;
              item.cummulative = item.cummulativeWithNoInterval;
            }
          })
          this.displayRoute(this.data);
          this.disableInitialLoader.emit();
          this.isBuildingRoute = false;
        }
        else {
          this.disableInitialLoader.emit();
          this.isBuildingRoute = false;
        }
      },
        (error: any) => {
          if (error?.error?.text == 'Error') {
            this.toastr.error('Couldnt build Route because the locations were associated to undefined Route.');
            this.disableInitialLoader.emit();
            this.isBuildingRoute = false;
          }
        });
    }
    else {
      this.disableInitialLoader.emit();
      this.isBuildingRoute = false;
      this.toastr.warning("Select or add atleast one location from the table")
    }
  }

  displayRoute(locs: any) {
    this.wayPoints = [];
    locs?.Route.map((loc: any, index: any) => {
      if (parseFloat(loc?.Latitude) == 0 || parseFloat(loc?.Longitude) == 0 || loc?.Latitude == "0" || loc?.Longitude == "0") {
        this.wayPoints.push(loc?.Location_Name + ', ' + loc?.Address)
      }
      else {
        let obj = { lat: parseFloat(loc?.Latitude), lng: parseFloat(loc.Longitude) };
        this.wayPoints.push(obj)
      }
      // if (loc?.Address) this.wayPoints.push(loc?.Location_Name + ', ' + loc?.Address);
      // else {
      //   let obj = { lat: parseFloat(loc?.Latitude), lng: parseFloat(loc.Longitude) };
      //   this.wayPoints.push(obj)
      // }

    });
    locs?.Route.map((item: any, i: any) => {
      if (i != 0 && i != locs?.Route.length - 1) {
        let loc_obj = { lat: parseFloat(item?.Latitude), lng: parseFloat(item?.Longitude) };
        if ((parseFloat(item?.Latitude) == parseFloat(locs?.Route[i - 1]?.Latitude) && parseFloat(item?.Longitude) == parseFloat(locs?.Route[i - 1]?.Longitude) && locs?.Route[i - 1]?.Latitude) || (parseFloat(item?.Longitude) == 0 && parseFloat(item?.Latitude) == 0) || (parseFloat(item?.Latitude) == parseFloat(locs?.Route[i + 1]?.Latitude) && parseFloat(item?.Longitude) == parseFloat(locs?.Route[i + 1]?.Longitude) && locs?.Route[i + 1]?.Latitude)) this.makeWaypointMarkers(loc_obj, item?.Location_Name + ', ' + item.Address, item?.Route, i, item?.Location_ID, item?.Washers, item?.Dryers,item)
        else this.makeWaypointMarkersbyLatLng(loc_obj, item?.Location_Name + ', ' + item.Address, item?.Route, i, item?.Location_ID, item?.Washers, item?.Dryers,item)
      }
    });
    this.makeMarker({ lat: this.origin.Latitude, lng: this.origin.Longitude }, "start", this.origin.Address_Line_1, this.origin.Route, this.origin.Location_ID,this.origin);
    this.makeMarker({ lat: this.destination.Latitude, lng: this.destination.Longitude }, "end", this.destination.Address_Line_1, this.destination.Route, this.destination.Location_ID,this.destination);
    var stations = this.wayPoints;
    let service = new google.maps.DirectionsService();
    var map = this.map;

    var lngs = locs?.Route.map(function (location: any) { return parseFloat(location.Longitude); });
    var lats = locs?.Route.map(function (location: any) { return parseFloat(location.Latitude); });
    lngs = lngs.filter((element: any) => {
      if (element !== undefined && element !== null && !Number.isNaN(element) && !isNaN(element)) return element;
    });
    lats = lats.filter((element: any) => {
      if (element !== undefined && element !== null && !Number.isNaN(element) && !isNaN(element)) return element;
    });

    map.fitBounds({
      west: Math.min.apply(null, lngs),
      east: Math.max.apply(null, lngs),
      north: Math.min.apply(null, lats),
      south: Math.max.apply(null, lats),
    });

    for (var i = 0, parts = [], max = 25 - 1; i < stations.length; i = i + max)
      parts.push(stations.slice(i, i + max + 1));

    var service_callback = (response: any, status: any) => {
      if (status != 'OK') {
        this.toastr.error('Location addresses are not provided correctly, so we could not determine the best route.');
        this.locationService.clearSelectionModel();
        this.addClusters.emit();
        this.clearWaypointMkrs();
        this.removeRoute();
        this.clearOriginDestinationMkrs();
        this.disableTerritoriesViewMode = false;
        return;
      }
      else {
        this.result = response;
        let legLength = this.result.routes[0].legs.length;
        var leg = this.result.routes[0].legs[0];
        var leg2 = this.result.routes[0].legs[legLength - 1];
        // this.makeMarker(leg2.end_location, "end", leg2.end_location, leg2);
        this.showRoutes = true;
        this.disableTerritoriesViewMode = true;
        this.showBuildRoute.emit(this.showRoutes);
      }
      let renderer = new google.maps.DirectionsRenderer();
      renderer.setMap(map);
      renderer.setOptions({ suppressMarkers: true, preserveViewport: true });
      renderer.setDirections(response);
      this.rendererArray.push(renderer)
      this.showRoutes = true;
      this.showBuildRoute.emit(this.showRoutes);
      this.locationService.setBuiltRouteExists(true);
    };

    // Send requests to service to get route (for stations count <= 25 only one request will be sent)
    for (var i = 0; i < parts.length; i++) {
      var waypoints = [];
      for (var j = 0; j < parts[i].length; j++)
        waypoints.push({ location: parts[i][j], stopover: false });
      let service_options: any = {
        origin: parts[i][0],
        destination: parts[i][parts[i].length - 1],
        waypoints: waypoints,
        optimizeWaypoints: true,
        provideRouteAlternatives: false,
        travelMode: google.maps.TravelMode.DRIVING,
      };
      service.route(service_options, service_callback);
    }

  }

  markLocations() {
    for (var i = 0, parts = [], max = 25 - 1; i < this.selectedLocations.length; i = i + max) {
      parts.push(this.selectedLocations.slice(i, i + max + 1));
    }
    for (var i = 0; i < parts.length; i++) {
      for (var j = 1; j < parts[i].length - 1; j++) {
        this.wayPoints?.push(parts[i][j]);
      }
    }
  }

  renderRoute() {
    this.directionsRenderer?.setDirections(this.shortestResult); // shortest or result
    this.showRoutes = true;
    this.disableTerritoriesViewMode = true;
    this.showBuildRoute.emit(this.showRoutes);
  }

  computeTotalDistance(result: any) {
    var totalDist = 0;
    var totalTime = 0;
    this.data?.Route_Details.map((item: any, idx: any) => {
      totalDist = totalDist + item.Distance_Value;
      totalTime = totalTime + item.Duration_Value;
    })
    totalDist = totalDist * 0.000621371;
    this.totalDistance = totalDist;
    this.totalDuration = this.secondsToDhms(totalTime.toFixed(2));
  }

  secondsToDhms(seconds: any) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600 * 24));
    var h = Math.floor(seconds % (3600 * 24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    var dDisplay = d > 0 ? d + (d == 1 ? " d " : " d ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " h " : " h ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " min " : " mins ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " seconds" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay;
  }



  shortestRoute(routeResults: google.maps.DirectionsResult | any) {
    if (routeResults.routes[0]) this.shortestRte = routeResults.routes[0];
    if (this.shortestRte) var shortestLength = this.shortestRte.legs[0].distance.value;
    for (var i = 1; i < routeResults.routes.length; i++) {
      if (routeResults.routes[i].legs[0].distance.value < shortestLength) {
        this.shortestRte = routeResults.routes[i];
        shortestLength = routeResults.routes[i].legs[0].distance.value;
      }
    }
    routeResults.routes = [this.shortestRte];
    this.showRoutes = true;
    this.disableTerritoriesViewMode = true;
    this.showBuildRoute.emit(this.showRoutes);
    return routeResults;
  }

  changeViewMode(ev: any) {
    if (this.selectedViewMode == 'zonesview') {
      this.zonesModeView = true;
      this.routesModeView = false;
      // this.addClusters.emit();
      this.clearWaypointMkrs();
      this.removeRoute();
      this.clearOriginDestinationMkrs();
      this.savedCheckedZonesList();
    }
    else {
      this.routesModeView = true;
      this.zonesModeView = false;
      this.hideZones.emit();
    }
  }

  initDrawingZone() {
    const dialogRef = this.dialog.open(NewterritoryformComponent, {
      data: {
        zones: this.polygonsatDb,
      }
    });
    dialogRef.afterClosed().subscribe((data: {}) => {
      if (data) {
        this.newTerritoryData = data;
        this.enableDrawingMode = true;
        this.drawingService.setDrawMode(true)
        this.initZoneCreation.emit(this.newTerritoryData);
      }
    });

  }

  OnPageChange(event: any) {
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.polygonsatDb.length) {
      endIndex = this.polygonsatDb.length;
    }
    this.start = startIndex;
    this.end = endIndex;
  }

  savedCheckedZonesList() {
    this.polygonsatDb.map((zone: any, idx: any) => {
      this.checkedZonesList.map((item: any) => {
        if (item && item?.zoneid == zone?.zoneid) zone.checked = true;
      })
    });

    this.checkedZonesList.map((zone: any) => {
      if (zone && zone?.zoneid) this.viewSinglePolygonWithoutBounds.emit(zone);
    })

  }

  compareArrayFunction(a: any, b: any) {
    return a.zoneid === b.zoneid;
  }

  onlyInLeft(left: any[], right: any[]) {
    return left.filter(leftValue =>
      !right.some(rightValue =>
        this.compareArrayFunction(leftValue, rightValue)));

  }


  addNewZonetoCheckList() {
    if (this.previousPolygonsatDB.length < this.polygonsatDb.length && this.previousPolygonsatDB) {
      const onlyInA = this.onlyInLeft(this.polygonsatDb, this.previousPolygonsatDB);
      const result: any[] = [...onlyInA];
      if (result.length > 0) {
        this.polygonsatDb.map((zone: any) => {
          result.map((item: any) => {
            if (item && item?.zoneid == zone?.zoneid) {
              this.checkedZonesList.push(zone);
              zone.checked = true;
              this.viewSinglePolygon.emit(zone)
            }
          })
        })
      }
    }
  }

  territorylistChange(ev: any, zone: any) {
    this.previousPolygonsatDB = [...this.polygonsatDb];
    if (ev?.checked) {
      this.viewSinglePolygon.emit(zone);
      this.polygonsatDb.map((item: any, idx: any) => {
        if (zone?.zoneid == item?.zoneid) item.checked = true;
      });
      this.updateCheckedZonesList();
    }
    else {
      this.hideSinglePolygon.emit(zone);
      this.polygonsatDb.map((item: any, idx: any) => {
        if (zone?.zoneid == item?.zoneid) item.checked = false;

      });
      this.updateCheckedZonesList();
    }
  }

  updateCheckedZonesList() {
    this.checkedZonesList = [];
    this.polygonsatDb.map((zone: any) => {
      if (zone && zone?.checked) this.checkedZonesList.push(zone);
    })
  }

  polygonClicktoJump(ev: any, poly: any) {
    this.jumpPolygonEvent.emit(poly);
  }

  showAllZones() {
    this.previousPolygonsatDB = [...this.polygonsatDb];
    this.polygonsatDb.map((item: any, idx: any) => {
      if (item) item.checked = true;
    });
    this.updateCheckedZonesList();
    this.showZones.emit();

  }

  hideAllZones() {
    this.previousPolygonsatDB = [...this.polygonsatDb];
    this.polygonsatDb.map((item: any, idx: any) => {
      if (item) item.checked = false;
    });
    this.updateCheckedZonesList();
    this.hideZones.emit();
  }

  deleteTerritory(zone: any) {
    this.previousPolygonsatDB = [...this.polygonsatDb];
    this.deleteZoneEvent.emit(zone);
  }

  editTerritory(zone: any) {
    this.previousPolygonsatDB = [...this.polygonsatDb];
    this.viewSinglePolygon.emit(zone);
    this.polygonsatDb.map((item: any, idx: any) => {
      if (zone?.zoneid == item?.zoneid) item.checked = true;
    });
    this.updateCheckedZonesList();

    this.editZoneEvent.emit(zone);
  }

  assignUserPrevileges(){
    let payload = {
     "Email":sessionStorage.getItem('userToken')
    }
    this.apiService.post(`${environment.testApiUrl}/user_views/${payload?.Email}`,payload).subscribe(
     (data:any)=>{
       this.currentUserViews = data;
       let user_restricted_columnsString = this.currentUserViews[0]?.user_restricted_columns;
       let user_restricted_columns = user_restricted_columnsString?.substring(1, user_restricted_columnsString?.length-1).split(" ");
       this.user_restricted_columns = user_restricted_columns;
     },
     (error)=>{
       this.toastr.error("Error in fetching User Previleges")
     }
   );
 }

  ngOnDestroy(): void {
    // clearInterval(this.fetchTimeInterval);
  }

}
