import { LocationStrategy } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnChanges, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
// import { MapInfoWindow } from '@angular/google-maps';
import MarkerClusterer from '@googlemaps/markerclustererplus';
import { isThisSecond } from 'date-fns';
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
import { LocationService } from '../services/location.service';
import { Loader } from "@googlemaps/js-api-loader"

interface TableObj {
  value: string;
  viewValue: string;
}
interface TableMode {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'store-map',
  templateUrl: './store-map.component.html',
  styleUrls: ['./store-map.component.css']
})
export class StoreMapComponent implements OnInit,AfterViewInit {

  @ViewChild('map', { static: false }) info: ElementRef | undefined;
  labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[4]);
  mkrs: any = [];
  shortestRte:any;
  map: any;
  // directionsService = new google.maps.DirectionsService();
  directionsRenderer: any;
  // stepDisplay = new google.maps.InfoWindow() ;
  showSliderMenu: boolean = false;
  showRoutes: boolean = false;
  result: any;
  totalDistance: any;
  totalDuration: any;
  infoWin: any ;
  wayPoints: any = [];
  shortestResult: any;
  pinSideMenu: boolean = false;
  displayDate: any;
  currentDate: any;
  displayTime: any;
  currentTime: any;
  @ViewChild('timepicker') timepicker: any;
  isOpen: any;
  formattedaddress = "";
  options: any = {
    componentRestrictions: {
      country: ["CA"]
    }
  };
  origin: any;
  destination: any;
  originMkr: any;
  destMkr: any;
  startstopmkr: any;
  // locs: any = environment?.locations;
  displayedColumns: string[] = [];
  dataBaseColumns: any;
  dataSource: any;
  selection = new SelectionModel<any>(true, []);
  selectedLocations: any = [];
  initiatedRoute: boolean = false;
  @ViewChild("sarea") sarea: any;
  @ViewChild('mapContainer', {static: false}) gmap: ElementRef | any;

  org = {
    "Account_ID": 4693269000024893259,
    "Address_Line_1": "100 Courtland Ave",
    "Address_Line_2": null,
    "Billable": false,
    "COD": false,
    "City": "Vaughan",
    "Coin_Card_Location": "Card-Mitech",
    "Collection_Frequency": null,
    "Collector_ID": null,
    "Country": "Canada",
    "Created_By_ID": 4693269000000297001,
    "Created_Time": "Wed, 23 Mar 2022 19:24:47 GMT",
    "Dryer_Coinage": "0.00",
    "Dryer_Time": "0.00",
    "Dryers": 3,
    "Effective_Date": null,
    "External_Key": null,
    "ID": 4693269000019033330,
    "Last_Activity_Time": "Wed, 24 Aug 2022 17:05:51 GMT",
    "Last_Collection_Date": "Tue, 14 Jul 2015 00:00:00 GMT",
    "Latitude": "43.814206386",
    "Location_ID": 1111111,
    "Location_Name": "Sparkle Solutions",
    "Location_Number": "1111111",
    "Location_Quotes_ID": 4693269000026883296,
    "Location_Status": "Active",
    "Location_Super": null,
    "Location_Super_Email": null,
    "Location_Super_Phone": null,
    "Location_Type": "Single Unit Building",
    "Longitude": "-79.532818106",
    "Modified_By_ID": 4693269000000297001,
    "Modified_Time": "Wed, 24 Aug 2022 17:05:51 GMT",
    "Next_Collection_Date": null,
    "Notes": null,
    "On_Hold": false,
    "On_Route": false,
    "Owner_ID": 4693269000000297001,
    "PO_Needed": false,
    "PO_Number": null,
    "Parent_Account_ID": null,
    "Phone_Number": null,
    "Postal_Code": "L4K 3T6",
    "Province": "Ontario",
    "Refund": false,
    "Refund_Amount": null,
    "Rental": true,
    "Route": null,
    "Route_ID": null,
    "Super_Address": null,
    "Super_Amount": "0.00",
    "Super_City": null,
    "Super_Province": null,
    "Super_Zip": null,
    "Tag": "[{\"name\":\"Original\",\"id\":\"4693269000036006126\"}]",
    "Unsubscribed_Mode": null,
    "Unsubscribed_Time": null,
    "Washer_Coinage": "0.00",
    "Washers": 3,
    "Zones": null
}
  fetched_locations: any;
  initialLoader: any;
  markerClusterer : any;


  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private toastr: ToastrServices, private dialog: MatDialog, private apiService: ApiService, private locationService: LocationService) { }

  ngOnChanges() { }

  callFnApi() {
    var locations: any = [];
    var selected_locations: any = [];
    this.apiService.get(`${environment?.coreApiUrl}/api/`).subscribe(
      (dat) => {
        this.fetched_locations = dat;
        this.initMap();
        this.initTable();
        this.makeClusters();
      });
  }

  ngOnInit() {
    const loader = new Loader({
      apiKey: "AIzaSyDHDZE9BzqQu0UUT_TuaS0pBzTbCoHEPJs",
      libraries: ['drawing','places','geometry','visualization'],
      language:"en"
    });
    
    this.locationService.getSelectedPoints().subscribe((item: any) => {
      this.selectedLocations = item;
    })
    this.initialLoader = true;
    loader.load().then(() => {
      this.infoWin = new google.maps.InfoWindow();
      this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        zoom: 12,
        center: { lat: 43.651070, lng: -79.347015 },
        gestureHandling: 'greedy'
      });
    });
   
    this.origin = this.org;
    this.destination = this.org;
    this.currentDate = new Date();
    this.currentTime = new Date();
    this.displayTime = this.formatAMPM(new Date());
    this.displayDate = new Date();
    this.callFnApi();
  }

  ngAfterViewInit(): void {}

  initTable() {
    this.dataSource = new MatTableDataSource<any>(this.fetched_locations?.data);
    this.displayedColumns = ['Location_Name', 'Route','On_Route', 'Billable', 'Location_Type', 'On_Hold' ,'Rental', 'Washers', 'Dryers' , 'Coin_Card_Location', 'Address_Line_1',
    'Address_Line_2','City', 'Distance'];
    // this.displayedColumns.unshift('op','select');
    this.displayedColumns.unshift('select');
  }

  initMap() {
    this.fetched_locations?.data?.map((location: any) => {
      if (location?.Location_ID !== this.origin?.Location_ID && location?.Location_ID != this.destination?.Location_ID) this.makemkrs({ lat: parseFloat(location?.Latitude), lng: parseFloat(location?.Longitude) }, location?.Location_Name, parseFloat(location?.Location_ID), location?.Route)
    });
    this.initialLoader = false;
    

  }

  public AddressChange(address: any) {
    this.formattedaddress = address.formatted_address;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {
        address: this.formattedaddress
      },
      (results: any, status: any) => {
        if (status === "OK" && results.length > 0) {
          const firstResult = results[0].geometry;
          const bounds = new google.maps.LatLngBounds();
          if (firstResult.viewport) {
            bounds.union(firstResult.viewport);
          } else {
            bounds.extend(firstResult.location);
          }
          this.map.fitBounds(bounds);
        }
      }
    );
  }

  clearSearchArea() {
    this.sarea.nativeElement.value = "";
    this.map.setCenter(new google.maps.LatLng(43.651070, -79.347015));
    this.map.setZoom(13);
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
    // this.initialLoader = true;
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
      label: { text: title, color: "#1440de", fontSize: "11px", fontWeight: '600', className: 'marker-position' },

    });
    google.maps.event.addListener(marker, 'click', (evt: any) => {
      this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${loc_id}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${title} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> ${route_name} </i> </p>
      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>
    </div>`);
      this.infoWin.open(this.map, marker);
    })
    this.mkrs.push(marker);
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

  makeClusters() {
    this.markerClusterer = new MarkerClusterer(this.map, this.mkrs, {
      imagePath:
        "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",

    });
    this.alignMaptoCenter();
   
  }

  alignMaptoCenter(){
    this.map.setCenter( { lat: 43.651070, lng: -79.347015 });
    // this.map.setZoom(13)
  }

  clearCluster(){
    this.markerClusterer.setMap(null);
    this.markerClusterer.clearMarkers();
  }

  enableLoader(){
    this.initialLoader = true;
  }
  disableLoader(){
    this.initialLoader = false;
  }




}