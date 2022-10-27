import { ToastrServices } from 'src/app/services/toastr.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmBoxComponent } from '../confirm-box/confirm-box.component';
import MarkerClusterer from '@googlemaps/markerclustererplus';
import * as moment from 'moment';
import { FormControl } from '@angular/forms';
import { TooltipPosition } from '@angular/material/tooltip';
import { ApiService } from 'src/app/services/api.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocationService } from '../services/location.service';
import { isThisSecond } from 'date-fns';
import { environment } from 'src/environments/environment';
import { animate, animation, style, transition, trigger, useAnimation, state, keyframes } from '@angular/animations';
import { ChangeDetectionStrategy, Component, ElementRef, OnChanges, OnInit, Input, Output, ViewChild, AfterViewInit, ChangeDetectorRef, EventEmitter } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';


@Component({
  selector: 'app-routeview',
  templateUrl: './routeview.component.html',
  styleUrls: ['./routeview.component.css'],
  animations: [
    trigger('navigation', [
      state('false', style({ right: '0%' })),
      state('true', style({ right: '-20%' })),
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
  directionsService = new google.maps.DirectionsService();
  directionsRenderer: any;
  stepDisplay = new google.maps.InfoWindow();
  showSliderMenu: boolean = false;
  result: any;
  rightanimationActive: boolean = false;
  leftanimationActive: boolean = false;
  totalDistance: any;
  totalDuration: any;
  infoWin: any = new google.maps.InfoWindow();
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
  @Input('fetched_locations') fetched_locations: any;
  @Input('origin') origin: any;
  @Input('destination') destination: any;
  @Input('map') map: any;
  @ViewChild('timepicker') timepicker: any;
  initialLoader: boolean = false;
  wypntMarkers: any;
  @Output('clearClusters') clearClusters = new EventEmitter();
  @Output('addClusters') addClusters = new EventEmitter();
  @Output('enableInitialLoader') enableInitialLoader = new EventEmitter();
  @Output('disableInitialLoader') disableInitialLoader = new EventEmitter();

  constructor(private locationService: LocationService, private dialog: MatDialog, private toastr: ToastrServices, private apiService: ApiService, private http: HttpClient) { }

  ngOnInit(): void {
    this.locationService.getSelectedPoints().subscribe((item: any) => {
      this.selectedLocations = item;
    });
    this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map, suppressMarkers: true });

    this.currentDate = new Date();
    this.currentTime = this.formatAMPM(new Date());
    this.displayTime = this.formatAMPM(new Date());
    this.displayDate = new Date();
    this.initMap();
    this.makeClusters();
  }

  ngOnChanges() {
    this.selection = this.locationService.getSelectionModel();
  }

  navigationDrawer() {
    this.navigation = !this.navigation;
    this.showOverlay = !this.showOverlay;
  }


  deleteWaypoint(loc: any) {
    this.selectedLocations.map((item: any, idx: any) => {
      if (loc.Location_Number == item.Location_Number) this.selectedLocations.splice(idx, 1);
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
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed == true) {
        this.showRoutes = false;
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
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed == true) {
        this.showRoutes = false;
        this.selectedLocations = [];
        this.locationService.setSelectedPoints([]);
        // this.selection.clear();
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
    })
  };

  editRoute() {
    this.showRoutes = !this.showRoutes;
  }

  downloadCSV() {
    if (this.data?.Route.length > 0) {
      let rows: any = [];
      this.data?.Route.map((item: any, idx: any) => {
        rows.push(Object.values(item))
      })
      rows.map((item: any, idx: any) => {
        item[0] = item[0].replace(/,/g, '')
      })
      rows.unshift(Object.keys(this.data?.Route[0]));
      let csvContent = "data:text/csv;charset=utf-8,";
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
      link.setAttribute("download", `${this.data?.Route[0]?.Route}-${today}.csv`);
      document.body.appendChild(link); // Required for FF
      link.click();
    }
    else this.toastr.warning("There are no selected Locations for current Route")

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

  dateChange(event: any): void {
    let date = event.value || event;
    this.displayDate = date;
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
      if (location?.Location_Number !== this.origin?.Location_Number && location?.Location_Number != this.destination?.Location_Number) this.makemkrs({ lat: parseFloat(location?.Latitude), lng: parseFloat(location?.Longitude) }, location?.Location_Name, parseFloat(location?.Location_Number), location?.Route)
    });
    this.initialLoader = false;

  }

  makeClusters() {
    var mkrClusters = new MarkerClusterer(this.map, this.mkrs, {
      imagePath:
        "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",

    });
  }


  makeMarker(position: any, icon: any, title: any, locObject: any) {
    let label = title + "";
    let obj = { lat: position.lat(), lng: position.lng() };
    if (icon == "start") {
      this.originMkr = new google.maps.Marker({
        position: obj,
        map: this.map,
        icon: "assets/flag-start.png",
        label: { text: title, color: "#1440de", fontSize: "11px", fontWeight: '600', className: 'marker-position' },
        title: label
      });
      google.maps.event.addListener(this.originMkr, 'click', (evt: any) => {
        this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${label}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${locObject?.start_address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> Empty </i> </p>
                      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>Remove</div> <div>G Map</div> <div>Street View</div>  <div>Move</div><div>
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
        this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${label}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${locObject?.start_address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> Empty </i> </p>
                      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>Remove</div> <div>G Map</div> <div>Street View</div>  <div>Move</div><div>
                    </div>`);
        this.infoWin.open(this.map, this.destMkr);
      })
      this.destMkr.setMap(this.map);
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

  makeWaypointMarkers(position: any, Address: any, Route_Name: any, i: any, Location_ID: any) {
    let label = i + "";
    let obj = { lat: position.lat, lng: position.lng };

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
      label: { text: label, color: "#ffffff", fontSize: "16px", fontWeight: '600', className: 'marker-position' },
      title: label
    });
    google.maps.event.addListener(waypoint, 'click', (evt: any) => {
      this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${Location_ID}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${Address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> ${Route_Name} </i> </p>
                      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>
                    </div>`);
      this.infoWin.open(this.map, waypoint);
    });

    waypoint.setMap(this.map)
    this.wypntMarkers?.push(waypoint);



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

  buildRoute() {
    this.clearWaypointMkrs();
    this.clearOriginDestinationMkrs();
    this.clearClusters.emit();
    this.enableInitialLoader.emit();
    if (this.selectedLocations.length > 0) {
      this.apiService.post(`${environment?.coreApiUrl}/build_route`, this.selectedLocations).subscribe(data => {
        if (data) {
          this.data = data;
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
  }

  displayRoute(locs: any) {
    this.wayPoints = [];
    locs?.Route.map((loc: any, index: any) => {
      let obj = { lat: parseFloat(loc?.Latitude), lng: parseFloat(loc.Longitude) }
      this.wayPoints.push(obj)
    });
    // this.wayPoints.splice(-1)
    locs?.Route.map((item: any, i: any) => {
      if (i != 0) {
        let loc_obj = { lat: parseFloat(item?.Latitude), lng: parseFloat(item?.Longitude) };
        this.makeWaypointMarkers(loc_obj, item.Address, item?.Route, i, item?.Location_ID)
      }

    })
    // this.wayPoints.unshift({lat:parseFloat(this.origin?.Latitude),lng:parseFloat(this.origin.Longitude)});
    // this.wayPoints.push({lat:parseFloat(this.destination?.Latitude),lng:parseFloat(this.destination.Longitude)});
    var stations = this.wayPoints;
    let service = new google.maps.DirectionsService();
    var map = this.map;
    var lngs = stations.map(function(station:any) { return station.lng; });
    var lats = stations.map(function(station:any) { return station.lat; });
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
        console.log('Directions request failed due to ' + status);
        return;
      }
      else {
        this.result = response;
        let legLength = this.result.routes[0].legs.length;
        var leg = this.result.routes[0].legs[0];
        var leg2 = this.result.routes[0].legs[legLength - 1];
        this.makeMarker(leg.start_location, "start", leg.start_location, leg);
        // this.makeMarker(leg2.end_location, "end", leg2.end_location, leg2);
        this.computeTotalDistance(response);
        this.showRoutes = true;
      }
      var renderer = new google.maps.DirectionsRenderer();
      renderer.setMap(map);
      renderer.setOptions({ suppressMarkers: true, preserveViewport: true });
      renderer.setDirections(response);
      this.rendererArray.push(renderer)
      this.showRoutes = true;
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
        travelMode: google.maps.TravelMode.DRIVING
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
  }

  computeTotalDistance(result: any) {
    var totalDist = 0;
    var totalTime = 0;
    var myroute = result.routes[0];
    for (let i = 0; i < this.data?.Route.length-1; i++) {
      totalDist += this.data?.Route[i].distance_value;
      totalTime += this.data?.Route[i].duration_value;
    }
    totalDist = totalDist / 1000.
    console.log("total distance is: " + totalDist + " km<br>total time is: " + (totalTime / 60).toFixed(2) + " minutes");
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
    return routeResults;
  }

}
