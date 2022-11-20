import { ToastrServices } from 'src/app/services/toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmBoxComponent } from '../confirm-box/confirm-box.component';
import MarkerClusterer from '@googlemaps/markerclustererplus';
import * as moment from 'moment';
import { FormControl } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip';
import { ApiService } from 'src/app/services/api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocationService } from '../../../../services/location.service';
import { isThisSecond } from 'date-fns';
import { environment } from 'src/environments/environment';
import { animate, animation, style, transition, trigger, useAnimation, state, keyframes } from '@angular/animations';
import { ChangeDetectionStrategy, Component, ElementRef, OnChanges, OnInit, Input, Output, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter, ViewEncapsulation, SimpleChanges, HostListener } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { DrawingService } from '../../../../services/drawing.service';
import { NewterritoryformComponent } from '../newterritoryform/newterritoryform.component'


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
export class RouteviewComponent implements OnInit, OnChanges {
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
  // map: any;
  directionsService: any;
  directionsRenderer: any;
  // stepDisplay = new google.maps.InfoWindow();
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
  @ViewChild('timepicker') timepicker: any;
  initialLoader: boolean = false;
  wypntMarkers: any;
  routesModeView: boolean = true;
  zonesModeView: boolean = false;
  viewObjects: ViewObj[] = [
    { value: 'routesview', viewValue: 'Route' },
    { value: 'zonesview', viewValue: 'Territories' },
  ];
  selectedViewMode = this.viewObjects[0].value;
  enableDrawingMode: boolean = false;
  selectedTerritories: any = [];
  zone_list: any = ['Territory-1'];
  pagedList: [] = [];
  length: number = 0;
  pageSize: number = 5;  
  pageSizeOptions: number[] = [3, 6, 5, 9, 10, 12, 26];
  start: any;
  end: any;
  newTerritoryData: any;
  checkedZonesList: any = [];
  previousPolygonsatDB: any = [];
  disableTerritoriesViewMode:boolean = false;


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


  constructor(private locationService: LocationService, private drawingService: DrawingService, private dialog: MatDialog, private toastr: ToastrServices, private apiService: ApiService, private http: HttpClient) { }

  ngOnInit(): void {
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
    this.drawingService.getDrawMode().subscribe((item: any) => {
      this.enableDrawingMode = item;

    })
    this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map, suppressMarkers: true });

    this.currentDate = new Date();
    this.currentTime = this.formatAMPM(new Date());
    this.displayTime = this.formatAMPM(new Date());
    this.displayDate = new Date();
    this.minTime = this.currentTime;
    this.initMap();
    this.makeClusters();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.selection = this.locationService.getSelectionModel();
    if (changes['polygonsatDb']) {
      this.savedCheckedZonesList();
      if(this.previousPolygonsatDB.length>0) this.addNewZonetoCheckList();
      this.previousPolygonsatDB = [...this.polygonsatDb];
    }
  }

  navigationDrawer() {
    this.navigation = !this.navigation;
    this.showOverlay = !this.showOverlay;
  }

  deleteWaypoint(loc: any) {
    this.selectedLocations.map((item: any, idx: any) => {
      if (loc.Location_ID == item.Location_ID) this.selectedLocations.splice(idx, 1);
    });
    this.locationService.setSelectedPoints(this.selectedLocations);
    // this.selection.clear();
    this.locationService.clearSelectionModel();
  }

  deleteAllWaypoints() {
    const dialogRef = this.dialog.open(ConfirmBoxComponent, {
      data: {
        locations: `${this.selectedLocations?.length}`,
        destinationRoute: null,
        clearRoute:true
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed == true) {
        this.showRoutes = false;
        this.disableTerritoriesViewMode = false;
        this.showBuildRoute.emit(this.showRoutes);
        this.selectedLocations = [];
        this.locationService.setSelectedPoints([]);
        // this.selection.clear();
        this.locationService.clearSelectionModel();
        this.addClusters.emit();
        this.clearWaypointMkrs();
        this.removeRoute();
        this.clearOriginDestinationMkrs();
      }
      // else this.selection.clear();
      else this.locationService.clearSelectionModel();
    });
  }
  clearAllWaypoints() {
    const dialogRef = this.dialog.open(ConfirmBoxComponent, {
      data: {
        locations: `${this.selectedLocations?.length}`,
        destinationRoute: null,
        clearRoute:false,
        isExistingRoute:(this.wypntMarkers && this.wypntMarkers.length>0) ? true : false
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed == true) {
        this.showRoutes = false;
        this.disableTerritoriesViewMode = false;
        this.showBuildRoute.emit(this.showRoutes);
        this.selectedLocations = [];
        this.locationService.setSelectedPoints([]);
        this.addClusters.emit();
        // this.selection.clear();
        this.clearWaypointMkrs();
        this.clearOriginDestinationMkrs();
        this.removeRoute();

        this.locationService.clearSelectionModel();
      }
      // else this.selection.clear();
      else this.locationService.clearSelectionModel();
    });
  }

  removeRoute() {
    this.rendererArray?.map((renderer: any) => {
      renderer?.setOptions({
        suppressPolylines: true
      });
      renderer?.setMap(null);
    });

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
          return String(value).replace('#', '');
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
      rows.unshift(keys);
      let csvContent = "data:text/csv;charset=utf-8,";
      rows[0].push("Amount");
      //
      let summaryData = this.findOcc(this.csvData, "Coin_Card_Location");
      rows.push([" ", " ", " "]);
      rows.push(["Summary"]);
      rows.push([" ", " ", " "]);
      rows.push(["Coin/Card Location", "Count"]);
      summaryData.map((item: any, idx: any) => {
        if (summaryData.length == 1) {
          rows.push(Object.values(item))
          rows.push([' ', ' ']);
        }
        else rows.push(Object.values(item))

      })
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
      link.setAttribute("download", `${this.csvData?.[1]?.Route}-${today}.csv`);
      document.body.appendChild(link); // Required for FF
      link.click();
    }
    else this.toastr.warning("There are no selected Locations for current Route")

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
    let mm: any = date.getMonth() + 1; // Months start at 0!
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
    this.fetched_locations?.data?.map((location: any) => {
      if (location?.Location_ID !== this.origin?.Location_ID && location?.Location_ID != this.destination?.Location_ID) this.makemkrs({ lat: parseFloat(location?.Latitude), lng: parseFloat(location?.Longitude) }, location?.Location_Name, parseFloat(location?.Location_ID), location?.Route)
    });
    this.initialLoader = false;

  }

  makeClusters() {
    var mkrClusters = new MarkerClusterer(this.map, this.mkrs, {
      imagePath:
        "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",

    });
  }


  makeMarker(position: any, icon: any, address: any, route: any, loc_id: any) {
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
        this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${loc_id}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> ${route} </i> </p>
                      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" ><div>
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
        this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${loc_id}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> ${route} </i> </p>
                      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" ><div>
                    </div>`);
        this.infoWin.open(this.map, this.destMkr);
      })
      this.destMkr?.setMap(this.map);
      this.startstopmkr?.push(this.destMkr);
    }
  }

  makemkrs(position: any, title: any, loc_id: any, route_name: any) {
    let label = title + "";
    let markerIcon = {
      url: 'assets/pin.png',
      scaledSize: new google.maps.Size(30, 30),
      labelOrigin: new google.maps.Point(-30, 10),
    };
    let obj = position;
    let marker = new google.maps.Marker({
      position: obj,
      map: this.map,
      icon: markerIcon,
      label: { text: label, color: "#1440de", fontSize: "11px", fontWeight: '600', className: 'marker-position' },

    });
    google.maps.event.addListener(marker, 'click', (evt: any) => {
      this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${loc_id}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${title} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> ${route_name} </i> </p>
      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>
    </div>`);
      this.infoWin.open(this.map, marker);
    })
    this.mkrs.push(marker);
  }
  makeWaypointMarkersbyLatLng(position: any, Address: any, Route_Name: any, i: any, Location_ID: any, washers: any, dryers: any) {
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
        strokeWeight: 2,
        fillColor: '#5384ED',
        strokeColor: '#ffffff',
      },
      label: { text: label, color: "#ffffff", fontSize: "16px", fontWeight: '600' },
      title: label
    });
    google.maps.event.addListener(waypoint, 'click', (evt: any) => {
      this.infoWin.setContent(`<div style= "padding:10px">  <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${Address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> ${Route_Name} </i> </p>
                    <p style="font-weight:400;font-size:13px"> Washers  &emsp;: &emsp; ${washers} </p> <p style="font-weight:400;font-size:13px"> Dryers  &emsp;&emsp;  : &emsp; ${dryers} </p>
                      <div style="display:flex;flex-direction:column;flex-wrap:wrap; gap:5%;font-weight:400;font-size:12px" > <div>
                    </div>`);
      this.infoWin.open(this.map, waypoint);
    });

    waypoint.setMap(this.map)
    this.wypntMarkers?.push(waypoint);

  }

  makeWaypointMarkers(position: any, Address: any, Route_Name: any, i: any, Location_ID: any, washers: any, dryers: any) {
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
            strokeWeight: 2,
            fillColor: '#5384ED',
            strokeColor: '#ffffff',
          },
          label: { text: label, color: "#ffffff", fontSize: "16px", fontWeight: '600' },
          title: label
        });
        google.maps.event.addListener(waypoint, 'click', (evt: any) => {
          this.infoWin.setContent(`<div style= "padding:10px">  <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${Address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> ${Route_Name} </i> </p>
                        <p style="font-weight:400;font-size:13px"> Washers  &emsp;: &emsp; ${washers} </p> <p style="font-weight:400;font-size:13px"> Dryers  &emsp;&emsp;  : &emsp; ${dryers} </p>
                          <div style="display:flex;flex-direction:column;flex-wrap:wrap; gap:5%;font-weight:400;font-size:12px" > <div>
                        </div>`);
          this.infoWin.open(this.map, waypoint);
        });

        waypoint.setMap(this.map)
        this.wypntMarkers?.push(waypoint);

      } else {
        this.toastr.warning('Geocode was not successful for the following reason: ' + status);
      }
    });



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
      this.clearWaypointMkrs();
      this.clearOriginDestinationMkrs();
      this.clearClusters.emit();
      this.enableInitialLoader.emit();
      this.selectedPoints = [...this.selectedLocations]
      this.selectedPoints.unshift(this.origin);
      this.apiService.post(`${environment?.coreApiUrl}/build_route`, this.selectedPoints).subscribe(data => {
        if (data) {
          this.data = data;
          this.clearClusters.emit();
          this.computeTotalDistance(data);
          this.csvData = [...data?.Route];
          this.csvData = this.csvData.map((item: any, idx: any) => {
            item = this.omit(item, ['Route_ID', 'Location_ID']);
            return item;
          })
          // this.data.Route.splice(-1);
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
        }
      });
    }
    else {
      this.disableInitialLoader.emit();
      this.toastr.warning("Select Add atleast One Location from the Table")
    }
  }

  displayRoute(locs: any) {
    this.wayPoints = [];
    locs?.Route.map((loc: any, index: any) => {
      // if(parseFloat(loc?.Latitude)==0 || parseFloat(loc?.Longitude) == 0 || loc?.Latitude=="0" || loc?.Longitude=="0") {
      //   this.wayPoints.push(loc?.Address)
      // }
      // else{
      //   let obj = { lat: parseFloat(loc?.Latitude), lng: parseFloat(loc.Longitude) };
      //   this.wayPoints.push(obj)
      // }
      if (loc?.Address) this.wayPoints.push(loc?.Location_Name + ', ' + loc?.Address);
      else {
        let obj = { lat: parseFloat(loc?.Latitude), lng: parseFloat(loc.Longitude) };
        this.wayPoints.push(obj)
      }

    });
    // this.wayPoints.splice(-1)
    locs?.Route.map((item: any, i: any) => {
      if (i != 0 && i != locs?.Route.length - 1) {
        let loc_obj = { lat: parseFloat(item?.Latitude), lng: parseFloat(item?.Longitude) };
        if ((parseFloat(item?.Latitude) == parseFloat(locs?.Route[i - 1]?.Latitude) && parseFloat(item?.Longitude) == parseFloat(locs?.Route[i - 1]?.Longitude) && locs?.Route[i - 1]?.Latitude) || (parseFloat(item?.Longitude) == 0 && parseFloat(item?.Latitude) == 0) || (parseFloat(item?.Latitude) == parseFloat(locs?.Route[i + 1]?.Latitude) && parseFloat(item?.Longitude) == parseFloat(locs?.Route[i + 1]?.Longitude) && locs?.Route[i + 1]?.Latitude)) this.makeWaypointMarkers(loc_obj, item?.Location_Name + ', ' + item.Address, item?.Route, i, item?.Location_ID, item?.Washers, item?.Dryers)
        else this.makeWaypointMarkersbyLatLng(loc_obj, item?.Location_Name + ', ' + item.Address, item?.Route, i, item?.Location_ID, item?.Washers, item?.Dryers)
      }
    });
    this.makeMarker({ lat: this.origin.Latitude, lng: this.origin.Longitude }, "start", this.origin.Address_Line_1, this.origin.Route, this.origin.Location_ID);
    this.makeMarker({ lat: this.destination.Latitude, lng: this.destination.Longitude }, "end", this.destination.Address_Line_1, this.destination.Route, this.destination.Location_ID);
    var stations = this.wayPoints;
    let service = new google.maps.DirectionsService();
    var map = this.map;

    var lngs = locs?.Route.map(function (location: any) { return parseFloat(location.Longitude); });
    var lats = locs?.Route.map(function (location: any) { return parseFloat(location.Latitude); });
    lngs = lngs.filter((element: any) => {
      if (element !== undefined && element !== null && element != NaN && !isNaN(element)) return element;
    });
    lats = lats.filter((element: any) => {
      if (element !== undefined && element !== null && element != NaN && !isNaN(element)) return element;
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
        console.warn('Directions request failed due to ' + status);
        this.toastr.warning('Directions request failed due to ' + status);
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
      var renderer = new google.maps.DirectionsRenderer();
      renderer.setMap(map);
      renderer.setOptions({ suppressMarkers: true, preserveViewport: true });
      renderer.setDirections(response);
      this.rendererArray.push(renderer)
      this.showRoutes = true;
      this.showBuildRoute.emit(this.showRoutes);
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

  compareArrayFunction(a:any,b:any){
    return a.zoneid === b.zoneid;
  }

  onlyInLeft(left:any[], right:any[]){
   return left.filter(leftValue =>
      !right.some(rightValue => 
        this.compareArrayFunction(leftValue, rightValue)));

  }
 

  addNewZonetoCheckList(){
    if(this.previousPolygonsatDB.length<this.polygonsatDb.length && this.previousPolygonsatDB){
      const onlyInA = this.onlyInLeft(this.polygonsatDb, this.previousPolygonsatDB);
      const result: any[] = [...onlyInA];
      if(result.length>0){
        this.polygonsatDb.map((zone:any)=>{
          result.map((item:any)=>{
            if(item && item?.zoneid == zone?.zoneid) {
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
    if (ev) {
      this.viewSinglePolygon.emit(zone);
      this.polygonsatDb.map((item: any, idx: any) => {
        if (zone?.id == item?.id) item.checked = true;
      });
      this.updateCheckedZonesList();
    }
    else {
      this.hideSinglePolygon.emit(zone);
      this.polygonsatDb.map((item: any, idx: any) => {
        if (zone?.id == item?.id) item.checked = false;

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
    this.editZoneEvent.emit(zone);
  }

  

}
