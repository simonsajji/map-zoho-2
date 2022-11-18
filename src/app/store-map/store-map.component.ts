import { LocationStrategy } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnChanges, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, Renderer2, ViewEncapsulation } from '@angular/core';
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
import { Loader } from "@googlemaps/js-api-loader";
import { DrawingService } from '../services/drawing.service';
import { RouteviewComponent } from '../routeview/routeview.component';
import { DeletezoneconfirmComponent } from '../deletezoneconfirm/deletezoneconfirm.component';

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
  styleUrls: ['./store-map.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class StoreMapComponent implements OnInit, AfterViewInit {

  @ViewChild('map', { static: false }) info: ElementRef | undefined;
  labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[4]);
  mkrs: any = [];
  shortestRte: any;
  map: any;
  // directionsService = new google.maps.DirectionsService();
  directionsRenderer: any;
  // stepDisplay = new google.maps.InfoWindow() ;
  showSliderMenu: boolean = false;
  showRoutes: boolean = false;
  result: any;
  totalDistance: any;
  totalDuration: any;
  infoWin: any;
  wayPoints: any = [];
  shortestResult: any;
  pinSideMenu: boolean = false;
  displayDate: any;
  currentDate: any;
  displayTime: any;
  currentTime: any;
  minTime: any;
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
  @ViewChild('mapContainer', { static: false }) gmap: ElementRef | any;
  fetched_locations: any;
  initialLoader: any;
  markerClusterer: any;
  drawingManager: any;
  listOfPolygons: any = [];
  fetchedPolygons: any = [];
  fetchedCoordinates: any = [];
  shapeOverlay: any;
  canvasMode: boolean = false;
  allOverlays: any = [];
  coordinates: any = [];
  all_overlays: any = [];
  selectedShape: any;
  enableEditMode: boolean = false;
  enableDeleteMode: boolean = false;
  @ViewChild('deltip') deltip: any;
  @ViewChild('menuchild') menuchild: any;
  tipObj: any | null;
  fetchedZones: any;
  allTerritoriesLoaded: boolean = false;
  newZoneForm: any;
  unsavedZoneList: any = [];
  openMapProperties: boolean = false;
  transparencyValue: number = 2;
  myLoc: any;
  attemptsFetchzones: any;
  enableDrawingMode:boolean = false;
  maxLimitReached:boolean = false;
  editCanvasMode:boolean = false;
  currentEditZone:any;


  constructor(private renderer: Renderer2, private http: HttpClient, private cdr: ChangeDetectorRef, private toastr: ToastrServices, private dialog: MatDialog, private apiService: ApiService, private locationService: LocationService, private drawingService: DrawingService) { }

  ngOnChanges() { }

  callFnApi() {
    this.apiService.get(`${environment?.coreApiUrl}/api/`).subscribe(
      (dat) => {
        this.fetched_locations = dat;
        this.initMap();
        this.initTable();
        this.makeClusters();
        this.callZonesApi();



      });
  }

  zonesApiErrorIntercept() {
    this.attemptsFetchzones++;
    if (this.attemptsFetchzones > 2) this.toastr.error("There was an error in Fetching Zones ")
    this.callZonesApi();
  }

  callZonesApi() {
    this.apiService.get(`${environment?.coreApiUrl}/zones`).subscribe(
      (res: any) => {
        if (!res) {
          this.toastr.warning('There was a problem fetching the zones. Trying again...');
          this.zonesApiErrorIntercept();
          return;
        }
        console.log(res?.Zone[0].data);
        console.log(res?.Loc_Count);
        let zoneInfo = res?.Loc_Count;
        this.fetchedZones = res?.Zone[0].data;
        if(zoneInfo){
          this.fetchedZones.map((zone:any)=>{
            zoneInfo.map((item:any)=>{
              if(item?.Zone){
                if(item?.Zone==zone?.Name && item?.Zone_ID==zone?.id) zone.dryers = item?.Dryer_Count;
                if(item?.Zone==zone?.Name && item?.Zone_ID==zone?.id) zone.washers = item?.Washer_Count;
              }
            })
          });

        }
        
        console.log(this.fetchedZones)
        let list_ids: any = [];
        let unique: any = []


        this.fetchedZones.map((item: any, idx: any) => {
          list_ids.push(item?.id)
        });
        unique = list_ids.filter((v: any, i: any, a: any) => a.indexOf(v) === i);
        console.log(unique, unique.length)
        console.log(list_ids, list_ids.length)

        this.unSetAllZonesfromMap() // resets the whole zones overlay exclding the newly drawn
        this.setDrawingManager();
        this.unSetCanvas();


      }
    )

  }

  ngOnInit() {
    this.transparencyValue = 2;
    this.allTerritoriesLoaded = false;
    this.attemptsFetchzones = 0;
    this.maxLimitReached = false;
    const loader = new Loader({
      apiKey: "AIzaSyDHDZE9BzqQu0UUT_TuaS0pBzTbCoHEPJs",
      libraries: ['drawing', 'places', 'geometry', 'visualization'],
      language: "en"
    });

    this.locationService.getSelectedPoints().subscribe((item: any) => {
      this.selectedLocations = item;
    });

    this.drawingService.getDrawMode().subscribe((item: any) => {
      this.canvasMode = item;
    })
    this.initialLoader = true;
    loader.load().then(() => {
      this.infoWin = new google.maps.InfoWindow();
      this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        zoom: 12,
        center: { lat: 43.651070, lng: -79.347015 },
        gestureHandling: 'greedy',
        streetViewControl: false,
        fullscreenControl: false,
      });
    });
  

    this.origin = environment?.org;
    this.destination = environment?.org;
    this.currentDate = new Date();
    this.currentTime = this.formatAMPM(new Date());
    this.displayTime = this.formatAMPM(new Date());
    this.displayDate = this.currentDate;
    this.minTime = this.currentTime;
    this.callFnApi();
  }

  ngAfterViewInit(): void { }

  initTable() {
    this.dataSource = new MatTableDataSource<any>(this.fetched_locations?.data);
    this.displayedColumns = ['Location_Name', 'Route', 'On_Route', 'Billable', 'Location_Type', 'On_Hold', 'Rental', 'Washers', 'Dryers', 'Coin_Card_Location', 'Address_Line_1',
      'Address_Line_2', 'City', 'Distance'];
    // this.displayedColumns.unshift('op','select');
    this.displayedColumns.unshift('select');
  }

  initMap() {
    this.fetched_locations?.data?.map((location: any) => {
      if (location?.Location_ID !== this.origin?.Location_ID && location?.Location_ID != this.destination?.Location_ID) this.makemkrs({ lat: parseFloat(location?.Latitude), lng: parseFloat(location?.Longitude) }, location?.Location_Name, parseFloat(location?.Location_ID), location?.Route)
    });
    this.initialLoader = false;
  }

  transparencyChange(ev: any) {
    this.transparencyValue = ev;
    if (ev >= 8) {
      this.map.setOptions({
        styles: [{ "stylers": [{ "gamma": ev / 4 }] }]
      })
    }
    else {
      this.map.setOptions({
        styles: [{ "stylers": [{ "gamma": 1 }] }]
      })

    }

  }

  navigateCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const longitude = position.coords.longitude;
        const latitude = position.coords.latitude;
        this.showPosition({ longitude, latitude });
      });
    }
    else {
      this.toastr.warning('Cannot fetch your Current Location')
    }
  }
  showPosition(position: any) {
    var lat = position.latitude;
    var lng = position.longitude;
    this.map.setCenter(new google.maps.LatLng(lat, lng));
  }

  enableEditingMode() {
    this.listOfPolygons.map((shape: any, idx: any) => {
      shape?.polygn?.setEditable(true);
    });
    this.fetchedPolygons.map((item: any, idx: any) => {
      item.setEditable(true)
    })
  }
  disableEditingMode() {
    this.listOfPolygons.map((shape: any, idx: any) => {
      shape.polygn?.setEditable(false);
    });
    this.fetchedPolygons.map((item: any, idx: any) => {
      item.setEditable(false)
    })
  }

  setCanvas(ev: any) {
    this.newZoneForm = ev;
    this.editCanvasMode = false;
    this.canvasMode = true;
  }

  unSetCanvas() {
    this.canvasMode = false;
    this.editCanvasMode = false;
    this.enableEditMode = false;
    this.setFreehandMode();
    this.removeAllNewZonesInList(); // removes only unsaved ones from new drawing
    // setting all zones  editable to false
    this.fetchedPolygons.map((item:any)=>{
      if(item?.polygon) item?.polygon.setEditable(false);
    })
    this.listOfPolygons.map((item:any)=>{
      if(item?.polygon) {
        item?.polygon.setEditable(false);
        item?.polygon.setMap(null);
      }
    });
    this.listOfPolygons = [];
    this.drawingService.setDrawMode(false);
  }

  setEditCanvasMode(){
    // only editing mode here
    this.canvasMode = false;
    this.drawingService.setDrawMode(true);
    this.editCanvasMode = true;
  }

  updateAllTerritories(){
    this.fetchedPolygons.map((zone:any)=>{
     if(zone) zone?.polygon.setEditable(false);
    });
    this.updateZone(this.currentEditZone)
  }


  setDrawingManager() {
    if (this.drawingManager) this.resetDrawingManager();
    else {
      this.drawingManager = new google.maps.drawing.DrawingManager({
        drawingControlOptions: {
          drawingModes: [
            google.maps.drawing.OverlayType.POLYLINE,
            google.maps.drawing.OverlayType.POLYGON
          ]

        },
        polygonOptions: {
          clickable: true,
          draggable: false,
          editable: true,
          fillColor: '#285ec9',
          fillOpacity: 0.3,
          strokeColor: '#285ec9'

        },
        polylineOptions: {
          clickable: true,
          draggable: true,
          editable: true,
        }
      });
      this.drawingManager.setMap(this.map);
      this.fetchedZones.map((item: any, idx: any) => {
        if (item?.Geocord) {
          var latlngs = item.Geocord.split('\r\n');
          latlngs = latlngs.map((item: any, id: any) => {
            let latLng = item.split(',');
            latLng = latLng.map((point: any) => { return parseFloat(point) });
            return latLng;
          })
          item.geocoords = latlngs;
        }
      });

      console.log("the drawing manager is set new");
      google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (event: any) => {
        event?.getPath().getLength();
        console.log(event);
        this.setFreehandMode();
        this.listOfPolygons.push({ id: this.listOfPolygons.length, polygon: event });
        if(this.listOfPolygons.length>=1) this.maxLimitReached = true;
        this.listOfPolygons.forEach((poly: any, idx: any) => {
          if (poly?.polygon) {
            google.maps.event.addListener(poly?.polygon, 'click', () => {
              if (this.enableDeleteMode) {
                poly?.polygon?.setMap(null);
                if (poly?.polygon) poly.polygon = null;
              }
              else this.setSelection(event);
            });

          }
          console.log(this.listOfPolygons)
        })
        google.maps.event.addListener(event, 'dragend', this.getPolygonCoords)
        google.maps.event.addListener(event.getPath(), 'insert_at', () => {
          this.coordinates.splice(0, this.coordinates?.length);
          let len = event?.getPath().getLength();
          for (let i = 0; i < len; i++) {
            this.coordinates.push(event.getPath().getAt(i).toUrlValue(5))
          }
          console.log(this.coordinates);
          console.log(this.listOfPolygons)
        })
        google.maps.event.addListener(event.getPath(), 'set_at', () => {
          console.log(event.getPath())
          this.coordinates.splice(0, this.coordinates?.length);
          let len = event?.getPath().getLength();
          for (let i = 0; i < len; i++) {
            this.coordinates.push(event.getPath().getAt(i).toUrlValue(5))
          }
        })
        console.log(this.coordinates);
      })
    
      this.setPolygonsfromDB();
      this.allTerritoriesLoaded = true;
    }
    this.hideAllZonesinCanvas();
  }

  setPolygonsfromDB() {
    // reseting the fetchedpolygons to empty and loading it with fetchedvalues from Database
      this.fetchedPolygons = [];
      this.removeAllNewZonesInList();

    this.fetchedZones.map((zone: any, idx: any) => {
      if (zone?.geocoords?.length > 0 && zone?.geocoords) {
        let geo = zone?.geocoords;
        let zoneColor;
        (zone?.Color) ? zoneColor = zone?.Color : zoneColor = 'gray';
        let points = [];
        for (let i = 0; i < zone?.geocoords.length; i++) {
          if (zone?.geocoords[i][0] && zone?.geocoords[i][1]) points.push({ lat: zone?.geocoords[i][0], lng: zone?.geocoords[i][1] });
        }
        if (points.length > 0) {
          let polygon = new google.maps.Polygon({
            paths: points,
            draggable: false,
            clickable: true,
            editable: false,
            strokeColor: zoneColor,
            strokeOpacity: 0.6,
            strokeWeight: 3,
            fillColor: zoneColor,
            fillOpacity: 0.4,
          });
          let bounds = new google.maps.LatLngBounds();
          for (let i = 0; i < points.length; i++) {
            bounds.extend(points[i]);
          }
          let infoWindow = new google.maps.InfoWindow();
          if(zone?.dryers && zone?.washers){
            infoWindow.setContent(`<div style= "padding:8px"> <p style="font-weight:400;font-size:13px">Washers &emsp;  : &emsp; ${(zone?.washers) ? zone?.washers : 0}  </p>   <p style="font-weight:400;font-size:13px">Dryers &emsp; &emsp; : &emsp; ${(zone?.dryers) ? zone?.dryers : 0} </p>
            <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>
            </div>`);
            infoWindow.setPosition(bounds.getCenter());
          }
        
         
          let posobj = bounds.getCenter();
          let marker: any = new google.maps.Marker({
            position: posobj,
            map: this.map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 0
            },
            label: { text: zone?.Name, color: zone.Color, fontSize: "18px", fontWeight: '600', className: 'marker-position-zones', fontFamily: 'Trebuchet' },
            opacity: 0.65

          });     

         let prevGeoCoordinates = points;

          marker.setMap(null);
          this.fetchedPolygons.push({ id: idx, zoneid: zone?.id, polygon: polygon, name: zone?.Name, info: infoWindow, centerPosition: bounds.getCenter(), marker: marker, comments:zone?.Comments,color:zone?.Color,prevGeoCoordinates:prevGeoCoordinates });
          
        }
      }
    })

    // fetchedPolygons need to be added to listener events

    if (this.fetchedPolygons.length > 0) {
      this.fetchedPolygons.forEach((poly: any, idx: any) => {


        if (poly?.polygon) {
          // need to store the original location ids first

           let location_ids_array: any = []
          for (var i = 0; i < this.mkrs.length; i++) {
            if (google.maps.geometry.poly?.containsLocation(this.mkrs[i].getPosition(), poly?.polygon)) {
              console.log(this.mkrs[i].location_id);
              location_ids_array.push(this.mkrs[i].location_id);
            }
          };

          poly.previous_location_ids = location_ids_array;
          
          poly?.polygon.setMap(this.map)
          poly.polygon?.setEditable(true);
          google.maps.event.addListener(poly?.polygon, 'dragend', this.getPolygonCoords)
          google.maps.event.addListener(poly?.polygon?.getPath(), 'insert_at', () => {
            // this.coordinates.splice(0,this.coordinates?.length);
            let len = poly?.polygon?.getPath().getLength();
            let location_ids_array: any = []
            for (var i = 0; i < this.mkrs.length; i++) {
              if (google.maps.geometry.poly?.containsLocation(this.mkrs[i].getPosition(), poly?.polygon)) {
                console.log(this.mkrs[i].location_id);
                location_ids_array.push(this.mkrs[i].location_id);
              }
            };
            poly.previousLocationIds = location_ids_array;

          })
          google.maps.event.addListener(poly?.polygon.getPath(), 'set_at', () => {
            // this.coordinates.splice(0,this.coordinates?.length);
            let len = poly?.polygon.getPath().getLength();
            let location_ids_array: any = []
            for (var i = 0; i < this.mkrs.length; i++) {
              if (google.maps.geometry.poly?.containsLocation(this.mkrs[i].getPosition(), poly?.polygon)) {
                console.log(this.mkrs[i].location_id);
                location_ids_array.push(this.mkrs[i].location_id);
              }
            };
            poly.previousLocationIds = location_ids_array;
            // for(let i=0;i<len;i++){
            //   this.coordinates.push(poly?.polygon.getPath().getAt(i).toUrlValue(5))
            // }

          });
          google.maps.event.addListener(poly?.polygon.getPath(), 'remove_at', () => {
            // this.coordinates.splice(0,this.coordinates?.length);
            let len = poly?.polygon.getPath().getLength();
            let location_ids_array: any = []
            for (var i = 0; i < this.mkrs.length; i++) {
              if (google.maps.geometry.poly?.containsLocation(this.mkrs[i].getPosition(), poly?.polygon)) {
                console.log(this.mkrs[i].location_id);
                location_ids_array.push(this.mkrs[i].location_id);
              }
            };
            poly.previousLocationIds = location_ids_array;
      
          });

          google.maps.event.addListener(poly?.polygon, 'click', (e: any) => {
            // poly?.info.open(this.map);
            poly?.marker.setMap(this.map)
            var bounds = new google.maps.LatLngBounds();
            poly?.polygon.getPath().forEach((element: any, index: any) => { bounds.extend(element); })
            this.map.fitBounds(bounds);
          });
          google.maps.event.addListener(poly?.polygon, 'mouseover', (e: any) => {
           if(poly?.info) poly?.info.open(this.map);
          });
          google.maps.event.addListener(poly?.polygon, 'mouseout', (e: any) => {
            if(poly?.info) poly?.info.close();
          });
        
        }
        console.log(this.fetchedPolygons);
      });
    }
    // here we have to unSetCanvas

  }

  jumptoPolygon(zone: any) {
    this.fetchedPolygons.map((poly: any, idx: any) => {
      if (zone?.id == poly?.id) {
        //   google.maps.event.addListener(this.map, 'zoom_changed', ()=> { 
        //     var zoom = this.map.getZoom(); 
        //     if (zoom <= 10) { 
        //         poly?.marker.setMap(null); 
        //     } else { 
        //         poly?.marker.setMap(this.map); 
        //     } 
        // });
        // poly?.marker.setMap(this.map);
        var bounds = new google.maps.LatLngBounds();
        poly?.polygon.getPath().forEach((element: any, index: any) => { bounds.extend(element); })
        this.map.fitBounds(bounds);
      }
    })
  }

  showPolygon(zone: any) {
    this.fetchedPolygons.map((poly: any, idx: any) => {
      if (zone?.zoneid == poly?.zoneid && zone?.polygon) {
        poly?.polygon.setMap(this.map);
        // google.maps.event.addListener(this.map, 'zoom_changed', () => {
        //   var zoom = this.map.getZoom();
        //   if (zoom <= 10) {
        //     poly?.marker.setMap(null);
        //   } else {
        //     poly?.marker.setMap(this.map);
        //   }
        // });
        poly?.marker.setMap(this.map);
        var bounds = new google.maps.LatLngBounds();
        poly?.polygon.getPath().forEach((element: any, index: any) => { bounds.extend(element); })
        this.map.fitBounds(bounds);
      }
    })

  }
  hidePolygon(zone: any) {
    this.fetchedPolygons.map((poly: any, idx: any) => {
      if (zone?.zoneid == poly?.zoneid) {
        if (zone?.polygon) zone?.polygon.setMap(null);
        if (zone?.polygon) zone?.marker.setMap(null);
      }
    })

  }

  editAllZones(){
    this.fetchedPolygons.map((item: any, idx: any) => {
      item.polygon.setEditable(true);
      if (item?.polygon) item?.polygon.setMap(this.map);
      item?.marker.setMap(this.map);
    })

  }

  editZone(zone:any){
    this.currentEditZone = zone;
    this.fetchedPolygons.map((item: any, idx: any) => {
      if(item?.zoneid == zone?.zoneid) {
        item.polygon.setEditable(true);
      }
    });
    this.enableEditMode = true;
    this.setEditCanvasMode();
    // this.updateZone(zone);

  }

  updateZone(zone:any){
    console.log(zone);
    this.initialLoader = true;
    this.fetchedPolygons.map((item: any, idx: any) => {
      if (item?.zoneid == zone.zoneid && item?.name == zone.name) {
        item?.polygon.setMap(null);
        item?.marker.setMap(null);
        console.log(item);
        let location_array: any = []
        for (var i = 0; i < this.mkrs.length; i++) {
          if (google.maps.geometry.poly?.containsLocation(this.mkrs[i].getPosition(), item?.polygon)) {
            console.log(this.mkrs[i].location_id);
            location_array.push(this.mkrs[i].location_id);
          }
        }

        let loc_ids: any = (location_array.length > 1) ? location_array : location_array[0];
        let prev_loc_ids:any = (item?.previous_location_ids?.length > 1) ? item?.previous_location_ids : item?.previous_location_ids[0];
        let obj = {
          "zone": {
            "Name": item.name,
            "id": item?.zoneid,
            "Color":item?.color,
            "Geocords":item?.polygon?.getPath().getArray(),
          "Comments":item?.comments
          },
          "locations": {
            "previous": prev_loc_ids,
            "new":loc_ids
          }
        }
        this.apiService.put(`${environment?.coreApiUrl}/update_zone`, obj).subscribe(
          (dat) => {
            console.log(dat);
            console.log("success")
          },
          (error: any) => {
            console.log(error);
            if (error?.status == 200) {
              this.editCanvasMode = false;
              this.removeAllNewZonesInList();
              this.unSetAllZonesfromMap();
              this.callZonesApi();
              this.hideAllZonesinCanvas();
              this.toastr.success('The Zone has been successfully Updated');
              this.initialLoader = false;
            }
            else {
              this.editCanvasMode = false;
              this.toastr.warning(error.statusText);
              this.removeAllNewZonesInList();
              this.unSetAllZonesfromMap();
              this.callZonesApi();
              this.hideAllZonesinCanvas();
              this.initialLoader = false;
            }
          }
        )
      }
    });
    
  }

  viewAllZonesinCanvas() {
    this.listOfPolygons.map((shape: any, idx: any) => {
      if (shape?.polygon) shape?.polygon?.setEditable(true);
      if (shape?.polygon) shape?.polygon?.setMap(this.map);
    });
    this.fetchedPolygons.map((item: any, idx: any) => {
      item.polygon.setEditable(false);
      if (item?.polygon) item?.polygon.setMap(this.map);
      item?.marker.setMap(this.map);
      
      // if (item?.polygon) item?.marker.setMap(this.map);
    })
  }
  hideAllZonesinCanvas() {
    // this.listOfPolygons.map((shape: any, idx: any) => {
    //   if (shape?.polygon) shape?.polygon?.setEditable(false);
    //   if (shape?.polygon) shape?.polygon?.setMap(null);
    //   if (shape?.marker) shape?.marker.setMap(null);
    // });
    this.fetchedPolygons.map((item: any, idx: any) => {
      if (item?.polygon) item.polygon.setEditable(false);
      if (item?.polygon) item?.polygon.setMap(null);
      item?.marker.setMap(null);
    })
  }

  saveZones() {
    let location_array: any = [];
    let geocoordinates: any = [];
    this.setFreehandMode();
    this.canvasMode = false;
    console.log(this.listOfPolygons);
    if (this.listOfPolygons.length > 1) {
      this.toastr.warning("Only Single Polygon can be SAVED as of now.");
      this.listOfPolygons.splice(1);
    }
    this.listOfPolygons.forEach((poly: any, idx: any) => {
      poly?.polygon.setEditable(false);
      console.log(poly?.polygon.getPath().getArray());
      if (poly?.polygon.getPath().getArray()) geocoordinates = poly?.polygon.getPath().getArray();
      for (var i = 0; i < this.mkrs.length; i++) {
        if (google.maps.geometry.poly?.containsLocation(this.mkrs[i].getPosition(), poly?.polygon)) {
          console.log(this.mkrs[i].location_id);
          location_array.push(this.mkrs[i].location_id);
        }
      }
    });
    geocoordinates = geocoordinates.map((item: any) => {
      let obj = { lat: item?.lat(), lng: item?.lng() };
      console.log(obj)
      return obj
    })
    console.log(geocoordinates)
    let loc_ids: any = (location_array.length > 1) ? location_array : location_array[0];

    console.log(loc_ids)
    let save_zones_obj = {
      "zone": {
        "Name": this.newZoneForm?.name,
        "Color": this.newZoneForm?.color,
        "Geocords": geocoordinates,
        "Comments": "Testing zones in zoftmap"
      },
      "locations": {
        "id": loc_ids
      }
    };
    console.log(save_zones_obj)
    this.initialLoader = true;
    this.apiService.post(`${environment?.coreApiUrl}/save_zone`, save_zones_obj).subscribe(
      (res: any) => {
        console.log(res);

        this.callZonesApi();
        this.removeAllNewZonesInList();
        // this.unSetCanvas();
        this.hideAllZonesinCanvas();
        this.initialLoader = false;
        this.toastr.success('Territories have been saved');
      },
      (error: any) => {
        console.log(error);
        if (error?.status == 200) {
          this.removeAllNewZonesInList();
          this.hideAllZonesinCanvas();
          this.callZonesApi();
          // this.unSetCanvas();
          this.initialLoader = false;
          this.toastr.success('Territories have been saved');
        }
        else {
          this.toastr.warning(error.statusText);
          this.unSetCanvas();
          this.initialLoader = false;
        }

      }

    )


  }

  removeAllNewZonesInList() {
    this.unsavedZoneList = [...this.listOfPolygons];
    this.listOfPolygons.map((poly: any) => {
      poly?.polygon.setEditable(false);
      poly.polygon.setMap(null);
    })
    this.listOfPolygons = [];
    this.maxLimitReached = false;
  }

  setPolygonDrawingMode() {
    
    if (this.drawingManager) {
      if(this.listOfPolygons && this.listOfPolygons.length>1){
        this.toastr.warning('Single Polygon can be saved as of now.');
        this.setFreehandMode();
        return;
      }
      else{
        this.enableDrawingMode = !this.enableDrawingMode;
        if(this.enableDrawingMode) this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
        else if(!this.enableDrawingMode) {
          this.setFreehandMode();
          this.drawingManager.setDrawingMode(null);
        }
        this.enableEditMode = false;
        this.enableDeleteMode = false;

      }
    
    }
  }

  cancelDrawing(){
    this.enableDrawingMode = false;
    this.removeIncompleteDrawing()
    this.setFreehandMode();

  }

  removeIncompleteDrawing(){
    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    this.drawingManager.setDrawingMode(null);

  }

  

  setFreehandMode() {
    if (this.drawingManager){
      this.removeIncompleteDrawing()
      this.enableDrawingMode = false;
      this.enableEditMode = false;
      this.enableDeleteMode = false;
      // this.toastr.info('FREE-HAND MODE');
    }

  }

  deleteModeToggle() {
    this.removeIncompleteDrawing();
    this.enableDeleteMode = !this.enableDeleteMode;
    if (this.enableDeleteMode){
      // this.toastr.info('DELETE MODE');
      this.removeAllNewZonesInList();
      this.enableDrawingMode = false;
      this.enableEditMode = false;
      this.enableDeleteMode = false;
    
    }
    else this.setFreehandMode();
    

  }


  editModeToggle() {
    this.removeIncompleteDrawing();
    this.enableEditMode = !this.enableEditMode;
    if (this.enableEditMode) {
      this.toastr.info('EDIT MODE');
      this.enableDeleteMode = false;
      this.enableDrawingMode = false;
      this.listOfPolygons.forEach((poly: any, idx: any) => {
        if (this.enableEditMode) poly?.polygon.setEditable(true);
      });
      // this.editAllZones();

    }
    else this.setFreehandMode();
      
  }

  getPolygonCoords(newShape: any) {
    this.coordinates.splice(0, this.coordinates.length)
    let len = newShape.getPath().getLength();
    for (let i = 0; i < len; i++) {
      this.coordinates.push(newShape.getPath().getAt(i).toUrlValue(6))
    }
    return this.coordinates;

  }

  setSelection(newShape: any) {
    // this.clearSelection();
    // this.stopDrawing()
    this.selectedShape = newShape;
    console.log(this.selectedShape)
    newShape.setEditable(true);

  }

  deleteZone(zone: any) {
    const dialogRef = this.dialog.open(DeletezoneconfirmComponent, {
      data: {
        zone: zone
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed == true) {
        this.initialLoader = true;
        this.confirmDeleteZone(zone);
      }
      else this.initialLoader = false;
    });



  }

  confirmDeleteZone(zone: any) {
    console.log(zone);
    this.initialLoader = true;
    this.fetchedPolygons.map((item: any, idx: any) => {
      if (item?.zoneid == zone.zoneid && item?.name == zone.name) {
        item?.polygon.setMap(null);
        item?.marker.setMap(null);
        console.log(item)
      }
    });
    let location_array: any = []
    for (var i = 0; i < this.mkrs.length; i++) {
      if (google.maps.geometry.poly?.containsLocation(this.mkrs[i].getPosition(), zone?.polygon)) {
        console.log(this.mkrs[i].location_id);
        location_array.push(this.mkrs[i].location_id);
      }
    }

    let loc_ids: any = (location_array.length > 1) ? location_array : location_array[0];
    let obj = {
      "zone": {
        "Name": zone.name,
        "id": zone?.zoneid
      },
      "locations": {
        "id": loc_ids
      }
    }
    this.apiService.delete(`${environment?.coreApiUrl}/delete_zone`, obj).subscribe(
      (dat) => {
        console.log(dat);
        console.log("success")
      },
      (error: any) => {
        console.log(error);
        if (error?.status == 200) {
          this.removeAllNewZonesInList();
          this.callZonesApi();
          this.hideAllZonesinCanvas();
          // this.unSetCanvas();
          this.initialLoader = true;
          this.toastr.success('The Zone has been successfully deleted');
          this.initialLoader = false;
        }
        else {
          this.toastr.warning(error.statusText);
          this.unSetCanvas();
          this.initialLoader = false;
        }
      }
    )
  }

  unSetAllZonesfromMap(){
    this.fetchedPolygons.map((item:any)=>{
      if(item?.poly) item?.poly?.setMap(null);
      if(item?.marker) item?.marker?.setMap(null);
    })
  }

  resetDrawingManager() {
    this.drawingManager.setMap(this.map);
    this.fetchedZones.map((item: any, idx: any) => {
      if (item?.Geocord) {
        var latlngs = item.Geocord.split('\r\n');
        latlngs = latlngs.map((item: any, id: any) => {
          let latLng = item.split(',');
          latLng = latLng.map((point: any) => { return parseFloat(point) });
          return latLng;
        })
        item.geocoords = latlngs;
      }
    });

    console.log("the drawing manager is set new");
    google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (event: any) => {
      event?.getPath().getLength();
      console.log(event);
      this.setFreehandMode();
      this.listOfPolygons.push({ id: this.listOfPolygons.length, polygon: event });
      if(this.listOfPolygons.length>=1) this.maxLimitReached = true;
      this.listOfPolygons.forEach((poly: any, idx: any) => {
        if (poly?.polygon) {
          google.maps.event.addListener(poly?.polygon, 'click', () => {
            if (this.enableDeleteMode) {
              poly?.polygon?.setMap(null);
              if (poly?.polygon) poly.polygon = null;
            }
            else this.setSelection(event);
          });

        }
        console.log(this.listOfPolygons)
      })
      google.maps.event.addListener(event, 'dragend', this.getPolygonCoords)
      google.maps.event.addListener(event.getPath(), 'insert_at', () => {
        this.coordinates.splice(0, this.coordinates?.length);
        let len = event?.getPath().getLength();
        for (let i = 0; i < len; i++) {
          this.coordinates.push(event.getPath().getAt(i).toUrlValue(5))
        }
        console.log(this.coordinates);
        console.log(this.listOfPolygons)
      })
      google.maps.event.addListener(event.getPath(), 'set_at', () => {
        console.log(event.getPath())
        this.coordinates.splice(0, this.coordinates?.length);
        let len = event?.getPath().getLength();
        for (let i = 0; i < len; i++) {
          this.coordinates.push(event.getPath().getAt(i).toUrlValue(5))
        }
      })
      console.log(this.coordinates);
    })
  
    this.setPolygonsfromDB();
    this.allTerritoriesLoaded = true;

  }

  setSelectedShape(shapeoverlay: any) {
    this.drawingManager.setDrawingMode(null);
    this.shapeOverlay = shapeoverlay;
  }

  clearSelection() {
    this.drawingManager.setDrawingMode(null);
    if (this.shapeOverlay) {
      console.log("clearing the selected shap[e");
      this.listOfPolygons[this.listOfPolygons.length - 1] = null;
      this.shapeOverlay.setMap(null);


    }
    this.listOfPolygons.splice(0, this.listOfPolygons.length);

  }

  stopDrawing() {
    // this.drawingManager.setMap(null);
    this.canvasMode = false;
    this.clearSelection();
    this.drawingService.setDrawMode(false);
    this.drawingManager.setDrawingMode(null);
    this.drawingManager.setMap(null)
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
    let marker: any = new google.maps.Marker({
      position: obj,
      map: this.map,
      icon: markerIcon,
      label: { text: title, color: "#1440de", fontSize: "11px", fontWeight: '600', className: 'marker-position' },

    });
    marker['location_id'] = loc_id;
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

  alignMaptoCenter() {
    this.map.setCenter({ lat: 43.651070, lng: -79.347015 });
    // this.map.setZoom(13)
  }

  clearCluster() {
    this.markerClusterer.setMap(null);
    this.markerClusterer.clearMarkers();
  }

  enableLoader() {
    this.initialLoader = true;
  }
  disableLoader() {
    this.initialLoader = false;
  }

  showBuildedRoute(ev: any) {
    this.showRoutes = ev;
  }




}