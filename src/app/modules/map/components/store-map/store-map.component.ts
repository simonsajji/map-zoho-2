import { LocationStrategy } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnChanges, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef, Renderer2, ViewEncapsulation, HostListener } from '@angular/core';
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
import { LocationService } from '../../../../services/location.service';
import { Loader } from "@googlemaps/js-api-loader";
import { DrawingService } from '../../../../services/drawing.service';
import { RouteviewComponent } from '../routeview/routeview.component';
import { DeletezoneconfirmComponent } from '../deletezoneconfirm/deletezoneconfirm.component';
import { Router } from '@angular/router'

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
  encapsulation: ViewEncapsulation.None,
  host: {
    '(document:click)': '(onBodyClick($event))'
  }
})
export class StoreMapComponent implements OnInit, AfterViewInit {

  @ViewChild('map', { static: false }) info: ElementRef | undefined;
  labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  positionOptions: TooltipPosition[] = ['after', 'before', 'above', 'below', 'left', 'right'];
  position = new FormControl(this.positionOptions[4]);
  mkrs: any = [];
  shortestRte: any;
  map: any;
  directionsRenderer: any;
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
  enableDrawingMode: boolean = false;
  maxLimitReached: boolean = false;
  editCanvasMode: boolean = false;
  currentEditZone: any;
  isMenuOpen: boolean = false;
  timeOutApiRequest: any;
  constructor(private renderer: Renderer2, private http: HttpClient, private cdr: ChangeDetectorRef, private toastr: ToastrServices, private dialog: MatDialog, private apiService: ApiService, private locationService: LocationService, private drawingService: DrawingService, private router: Router) { }

  ngOnChanges() { }

  callFnApi() {
    this.apiService.get(`${environment?.coreApiUrl}/api/`).subscribe(
      (dat) => {
        this.fetched_locations = dat;
        this.initMap();
        this.initTable();
        this.makeClusters();
        this.callZonesApi();
        if (!dat) {
          this.toastr.warning("Error occured in fetching locations");
          this.initialLoader = false;
        }
      },
      (error) => {
        if (error?.status !== 200) {
          this.toastr.error("Error occured in fetching locations");
          this.initialLoader = false;
        }
      }
    );
  }

  zonesApiErrorIntercept() {
    this.attemptsFetchzones++;
    if (this.attemptsFetchzones > 2) this.toastr.error("There was an error in fetching the zones ")
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
        let zoneInfo = res?.Loc_Count;
        this.fetchedZones = res?.Zone[0].data;
        if (zoneInfo) {
          this.fetchedZones.map((zone: any) => {
            zoneInfo.map((item: any) => {
              if (item?.Zone) {
                if (item?.Zone == zone?.Name && item?.Zone_ID == zone?.id) zone.dryers = item?.Dryer_Count;
                if (item?.Zone == zone?.Name && item?.Zone_ID == zone?.id) zone.washers = item?.Washer_Count;
              }
            })
          });

        }

        let list_ids: any = [];
        let unique: any = []
        this.fetchedZones.map((item: any, idx: any) => {
          list_ids.push(item?.id)
        });
        unique = list_ids.filter((v: any, i: any, a: any) => a.indexOf(v) === i);
        this.unSetAllZonesfromMap() // resets the whole zones overlay exclding the newly drawn
        this.setDrawingManager();
        // this.unSetCanvas();
      },
      (error: any) => {
        if (error?.status != 200) {
          this.toastr.error('Error occured while fetching the updated zones');
          this.initialLoader = false;
          this.unSetCanvas();
        }
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
      if (location?.Location_ID !== this.origin?.Location_ID && location?.Location_ID != this.destination?.Location_ID) this.makemkrs({ lat: parseFloat(location?.Latitude), lng: parseFloat(location?.Longitude) }, location?.Location_Name, parseFloat(location?.Location_ID), location?.Route,location?.Address_Line_1,location?.Address_Line_2,location?.Dryers,location?.Washers,location?.Location_Name,location?.City,location?.Country)
    });
    // this.initialLoader = false;
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
    this.drawingManager.setOptions({
      polygonOptions: {
        clickable: true,
        draggable: false,
        editable: true,
        fillOpacity: 0.3,
        strokeWeight: 3,
        fillColor: (this.newZoneForm?.color) ? this.newZoneForm?.color : '#285ec9',
        strokeColor: (this.newZoneForm?.color) ? this.newZoneForm?.color : '#285ec9',

      }

    })
    this.editCanvasMode = false;
    this.canvasMode = true;
  }

  unSetCanvas() {
    this.canvasMode = false;
    this.editCanvasMode = false;
    this.enableEditMode = false;
    this.setFreehandMode();
    this.removeAllNewZonesInList(); // removes only unsaved ones from new drawing
    this.fetchedPolygons.map((item: any) => {
      if (item?.polygon) item?.polygon.setEditable(false);
    })
    this.listOfPolygons.map((item: any) => {
      if (item?.polygon) {
        item?.polygon.setEditable(false);
        item?.polygon.setMap(null);
      }
    });

    this.currentEditZone = null;
    this.listOfPolygons = [];
    this.drawingService.setDrawMode(false);
    this.initialLoader = false;
  }
  cancelUpdate() {
    this.canvasMode = false;
    this.editCanvasMode = false;
    this.enableEditMode = false;
    this.setFreehandMode();
    this.removeAllNewZonesInList(); // removes only unsaved ones from new drawing
    if (this.currentEditZone) {
      this.fetchedPolygons.map((item: any, idx: any) => {
        if (item?.zoneid == this.currentEditZone?.zoneid) {
          if (item?.polygon && this.currentEditZone?.polygon) {
            item.polygon.setPath(this.currentEditZone.prevGeoCoordinates);
          }
        }
      });

    }
    this.fetchedPolygons.map((item: any) => {
      if (item?.polygon) item?.polygon.setEditable(false);
    })
    this.listOfPolygons.map((item: any) => {
      if (item?.polygon) {
        item?.polygon.setEditable(false);
        item?.polygon.setMap(null);
      }
    });

    this.currentEditZone = null;
    this.listOfPolygons = [];
    this.drawingService.setDrawMode(false);
    this.initialLoader = false;
  }

  setEditCanvasMode() {
    // only editing mode here
    this.canvasMode = false;
    this.drawingService.setDrawMode(true);
    this.editCanvasMode = true;
  }

  updateAllTerritories() {
    this.editCanvasMode = false;
    this.canvasMode = false;
    this.fetchedPolygons.map((zone: any) => {
      if (zone) zone?.polygon.setEditable(false);
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
          strokeColor: '#285ec9',
          strokeWeight: 3,

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

      google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (event: any) => {
        event?.getPath().getLength();
        this.setFreehandMode();
        if (this.listOfPolygons.length == 0) this.listOfPolygons.push({ id: this.listOfPolygons.length, polygon: event });
        if (this.listOfPolygons.length >= 1) this.maxLimitReached = true;
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

        })
        google.maps.event.addListener(event, 'dragend', this.getPolygonCoords)
        google.maps.event.addListener(event.getPath(), 'insert_at', () => {
          this.coordinates.splice(0, this.coordinates?.length);
          let len = event?.getPath().getLength();
          for (let i = 0; i < len; i++) {
            this.coordinates.push(event.getPath().getAt(i).toUrlValue(5))
          }
        })
        google.maps.event.addListener(event.getPath(), 'set_at', () => {
          this.coordinates.splice(0, this.coordinates?.length);
          let len = event?.getPath().getLength();
          for (let i = 0; i < len; i++) {
            this.coordinates.push(event.getPath().getAt(i).toUrlValue(5))
          }
        })
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
          if (zone?.dryers && zone?.washers) {
            infoWindow.setContent(`<div style= "padding:8px"><p style="font-weight:500;font-size:13px">${zone?.Name} </p> <p style="font-weight:400;font-size:13px">Number of Washers  &nbsp;  : &emsp; ${(zone?.washers) ? zone?.washers : 0}  </p>   <p style="font-weight:400;font-size:13px">Number of Dryers &emsp; &hairsp; : &emsp; ${(zone?.dryers) ? zone?.dryers : 0} </p>
            <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>
            </div>`);
            infoWindow.setPosition(bounds.getCenter());
          }

          else {
            infoWindow.setContent(`<div style= "padding:8px"><p style="font-weight:500;font-size:13px">${zone?.Name} </p> <p style="font-weight:400;font-size:13px">Number of Washers  &nbsp;  : &emsp; ${(zone?.washers) ? zone?.washers : 0}  </p>   <p style="font-weight:400;font-size:13px">Number of Dryers &emsp; &hairsp; : &emsp; ${(zone?.dryers) ? zone?.dryers : 0} </p>
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
          this.fetchedPolygons.push({ id: idx, zoneid: zone?.id, polygon: polygon, name: zone?.Name, info: infoWindow, centerPosition: bounds.getCenter(), marker: marker, comments: zone?.Comments, color: zone?.Color, prevGeoCoordinates: prevGeoCoordinates });

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
                location_ids_array.push(this.mkrs[i].location_id);
              }
            };
            poly.previousLocationIds = location_ids_array;
          });
          google.maps.event.addListener(poly?.polygon.getPath(), 'remove_at', () => {
            // this.coordinates.splice(0,this.coordinates?.length);
            let len = poly?.polygon.getPath().getLength();
            let location_ids_array: any = []
            for (var i = 0; i < this.mkrs.length; i++) {
              if (google.maps.geometry.poly?.containsLocation(this.mkrs[i].getPosition(), poly?.polygon)) {
                location_ids_array.push(this.mkrs[i].location_id);
              }
            };
            poly.previousLocationIds = location_ids_array;

          });
          google.maps.event.addListener(poly?.polygon, 'click', (e: any) => {
            this.fetchedPolygons.map((zone: any) => {
              if (zone?.info) zone?.info.close();
            })
            if (poly?.info) poly?.info.open(this.map);
            poly?.marker.setMap(this.map)
            var bounds = new google.maps.LatLngBounds();
            poly?.polygon.getPath().forEach((element: any, index: any) => { bounds.extend(element); })
            this.map.fitBounds(bounds);
          });

          google.maps.event.addListener(this.map, 'zoom_changed', () => {
            var zoom = this.map.getZoom();
            if (zoom <= 9) {
              if (zoom <= 6) poly?.marker.setLabel({ text: poly?.name, color: poly.color, fontSize: `0px`, fontWeight: '600', fontFamily: 'Trebuchet', className: 'marker-position-zones' });
              else poly?.marker.setLabel({ text: poly?.name, color: poly?.color, fontSize: `${zoom + 2}px`, fontWeight: '600', fontFamily: 'Trebuchet', className: 'marker-position-zones' });
            }
            else poly?.marker.setLabel({ text: poly?.name, color: poly.color, fontSize: "17px", fontWeight: '600', fontFamily: 'Trebuchet', className: 'marker-position-zones' });
          });
        }
      });
    }
    this.unSetCanvas();
  }

  jumptoPolygon(zone: any) {
    this.fetchedPolygons.map((poly: any, idx: any) => {
      if (zone?.zoneid == poly?.zoneid) {
        var bounds = new google.maps.LatLngBounds();
        poly?.polygon.getPath().forEach((element: any, index: any) => { bounds.extend(element); })
        this.map.fitBounds(bounds);
      }
    })
  }

  showPolygonWithoutBounds(zone: any) {
    this.fetchedPolygons.map((poly: any, idx: any) => {
      if (zone?.zoneid == poly?.zoneid && zone?.polygon) {
        poly?.polygon.setMap(this.map);
        poly?.marker.setMap(this.map);
      }
    })

  }

  showPolygon(zone: any) {
    this.fetchedPolygons.map((poly: any, idx: any) => {
      if (zone?.zoneid == poly?.zoneid && zone?.polygon) {
        poly?.polygon.setMap(this.map);
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
        if (zone?.info) zone?.info?.close();
      }
    })

  }

  editAllZones() {
    this.fetchedPolygons.map((item: any, idx: any) => {
      item.polygon.setEditable(true);
      if (item?.polygon) item?.polygon.setMap(this.map);
      if (item?.marker) item?.marker.setMap(this.map);
    })

  }

  editZone(zone: any) {
    this.currentEditZone = zone;
    this.currentEditZone?.info?.setMap(null);
    this.fetchedPolygons.map((item: any, idx: any) => {
      if (item?.zoneid == zone?.zoneid) {
        if (item?.polygon) item.polygon.setEditable(true);
        if (item?.info) item?.info.setMap(null);
        if (item?.polygon) {
          let bounds = new google.maps.LatLngBounds();
          item?.polygon.getPath().forEach((element: any, index: any) => { bounds.extend(element); })
          this.map.fitBounds(bounds);
        }
        // set bounds here only for current edit zone
      }
    });
    this.enableEditMode = true;
    this.setEditCanvasMode();

  }

  updateZone(zone: any) {
    this.initialLoader = true;
    this.fetchedPolygons.map((item: any, idx: any) => {
      if (item?.zoneid == zone.zoneid && item?.name == zone.name) {
        item?.polygon.setMap(null);
        item?.marker.setMap(null);
        let location_array: any = []
        for (var i = 0; i < this.mkrs.length; i++) {
          if (google.maps.geometry.poly?.containsLocation(this.mkrs[i].getPosition(), item?.polygon)) {
            location_array.push(this.mkrs[i].location_id);
          }
        }
        let loc_ids: any = (location_array.length > 1) ? location_array : location_array[0];
        let prev_loc_ids: any = (item?.previous_location_ids?.length > 1) ? item?.previous_location_ids : item?.previous_location_ids[0];
        if (loc_ids == undefined || null) loc_ids = null;
        if (prev_loc_ids == undefined || null) prev_loc_ids = null;
        let obj = {
          "zone": {
            "Name": item.name,
            "id": item?.zoneid,
            "Color": item?.color,
            "Geocords": item?.polygon?.getPath().getArray(),
            "Comments": item?.comments
          },
          "locations": {
            "previous": prev_loc_ids,
            "new": loc_ids
          }
        }
        this.apiService.put(`${environment?.coreApiUrl}/update_zone`, obj).subscribe(
          (dat) => {
            this.removeAllNewZonesInList();
          },
          (error: any) => {
            // console.log(error);
            if (error?.status == 200) {
              clearTimeout(this.timeOutApiRequest);
              this.timeOutApiRequest = setTimeout(() => {
                this.editCanvasMode = false;
                this.removeAllNewZonesInList();
                this.unSetAllZonesfromMap();
                this.callZonesApi();
                this.hideAllZonesinCanvas();
                this.toastr.success('The Territory has been successfully updated');
                // this.initialLoader = false;
              }, 2500)

            }
            else {
              this.editCanvasMode = false;
              this.removeAllNewZonesInList();
              this.unSetAllZonesfromMap();
              this.callZonesApi();
              this.hideAllZonesinCanvas();
              this.toastr.error("Error occured while updating the Territories");
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
      if (item?.polygon) item.polygon.setEditable(false);
      if (item?.polygon) item?.polygon.setMap(this.map);
      if (item?.marker) item?.marker.setMap(this.map);
      google.maps.event.addListener(this.map, 'zoom_changed', () => {
        var zoom = this.map.getZoom();
        if (zoom <= 9) {
          if (zoom <= 6) item?.marker.setLabel({ text: item?.name, color: item.color, fontSize: `0px`, fontWeight: '600', fontFamily: 'Trebuchet' });
          else item?.marker.setLabel({ text: item?.name, color: item.color, fontSize: `${zoom + 2}px`, fontWeight: '600', fontFamily: 'Trebuchet' });
        }

        else {
          item?.marker.setLabel({ text: item?.name, color: item.color, fontSize: "16px", fontWeight: '600', fontFamily: 'Trebuchet' });
        }
      });
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
      if (item?.marker) item?.marker.setMap(null);
      if (item?.info) item?.info?.close();
    })
  }

  saveZones() {
    let location_array: any = [];
    let geocoordinates: any = [];
    this.setFreehandMode();
    this.canvasMode = false;
    if (this.listOfPolygons.length > 1) {
      this.listOfPolygons.splice(1);
    }
    this.listOfPolygons.forEach((poly: any, idx: any) => {
      poly?.polygon.setEditable(false);
      if (poly?.polygon.getPath().getArray()) geocoordinates = poly?.polygon.getPath().getArray();
      for (var i = 0; i < this.mkrs.length; i++) {
        if (google.maps.geometry.poly?.containsLocation(this.mkrs[i].getPosition(), poly?.polygon)) {
          location_array.push(this.mkrs[i].location_id);
        }
      }
    });
    geocoordinates = geocoordinates.map((item: any) => {
      let obj = { lat: item?.lat(), lng: item?.lng() };
      return obj;
    })
    let loc_ids: any = (location_array.length > 1) ? location_array : location_array[0];
    let save_zones_obj = {
      "zone": {
        "Name": this.newZoneForm?.name,
        "Color": this.newZoneForm?.color,
        "Geocords": geocoordinates,
        "Comments": this.newZoneForm?.comments
      },
      "locations": {
        "id": loc_ids
      }
    };
    this.initialLoader = true;
    this.apiService.post(`${environment?.coreApiUrl}/save_zone`, save_zones_obj).subscribe(
      (res: any) => {
        this.callZonesApi();
        this.removeAllNewZonesInList();
        // this.unSetCanvas();
        this.hideAllZonesinCanvas();
        this.initialLoader = false;
        this.toastr.success('Territories have been saved');
      },
      (error: any) => {

        // console.log(error);
        if (error?.status == 200) {
          clearTimeout(this.timeOutApiRequest);
          this.timeOutApiRequest = setTimeout(() => {
            this.removeAllNewZonesInList();
            this.unSetAllZonesfromMap();
            this.callZonesApi();
            this.hideAllZonesinCanvas();
            // this.initialLoader = false;
            // this.unSetCanvas();
            this.toastr.success('Territories have been saved');

          }, 2500);

        }
        else {
          this.removeAllNewZonesInList();
          this.unSetAllZonesfromMap();
          this.callZonesApi();
          this.hideAllZonesinCanvas();
          this.toastr.error("Error occured while saving the Territories");
        }
      }
    )
  }

  removeAllNewZonesInList() {
    this.unsavedZoneList = [...this.listOfPolygons];
    this.listOfPolygons.map((poly: any) => {
      if (poly?.polygon) poly?.polygon.setEditable(false);
      if (poly?.polygon) poly.polygon.setMap(null);
    })
    this.listOfPolygons = [];
    this.maxLimitReached = false;
  }

  setPolygonDrawingMode() {

    if (this.drawingManager) {
      if (this.listOfPolygons && this.listOfPolygons.length > 1) {
        this.toastr.warning('Single Polygon can be saved as of now.');
        this.enableEditMode = true;
        this.setFreehandMode();
        return;
      }
      else if (this.listOfPolygons.length < 1) {
        this.enableDrawingMode = !this.enableDrawingMode;
        if (this.enableDrawingMode) this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
        else if (!this.enableDrawingMode) {
          this.setFreehandMode();
          this.drawingManager.setDrawingMode(null);
        }
        // this.enableEditMode = false;
        // this.enableEditMode = false;
        this.enableDeleteMode = false;
      }
    }
  }

  cancelDrawing() {
    this.enableDrawingMode = false;
    this.removeIncompleteDrawing()
    this.setFreehandMode();

  }

  removeIncompleteDrawing() {
    this.drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    this.drawingManager.setDrawingMode(null);

  }

  setFreehandMode() {
    if (this.drawingManager) {
      this.removeIncompleteDrawing()
      this.enableDrawingMode = false;
      this.enableEditMode = false;
      this.enableDeleteMode = false;
    }
  }

  deleteModeToggle() {
    this.removeIncompleteDrawing();
    this.enableDeleteMode = !this.enableDeleteMode;
    if (this.enableDeleteMode) {
      // this.toastr.info('DELETE MODE');
      this.removeAllNewZonesInList();
      this.enableDrawingMode = false;
      this.enableEditMode = false;
      this.enableDeleteMode = false;
    }
    else this.setFreehandMode();
  }

  deleteDrawnZone() {
    this.removeIncompleteDrawing();
    this.removeAllNewZonesInList();
    this.enableDrawingMode = false;
    this.enableEditMode = false;
    this.enableDeleteMode = false;
  }

  editModeToggle() {
    this.removeIncompleteDrawing();
    this.enableEditMode = !this.enableEditMode;
    if (this.enableEditMode) {
      // this.toastr.info('EDIT MODE');
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
    this.selectedShape = newShape;
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
    this.initialLoader = true;
    this.fetchedPolygons.map((item: any, idx: any) => {
      if (item?.zoneid == zone.zoneid && item?.name == zone.name) {
        //  if(item?.polygon) item?.polygon.setMap(null);
        //  if(item?.marker) item?.marker.setMap(null);
        if (item?.info) item?.info.close();
      }
    });
    let location_array: any = []
    for (var i = 0; i < this.mkrs.length; i++) {
      if (google.maps.geometry.poly?.containsLocation(this.mkrs[i].getPosition(), zone?.polygon)) {
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
        this.removeAllNewZonesInList();
        this.callZonesApi();
      },
      (error: any) => {
        // console.log(error);
        if (error?.status == 200) {
          clearTimeout(this.timeOutApiRequest);
          this.timeOutApiRequest = setTimeout(() => {
            this.removeAllNewZonesInList();
            this.callZonesApi();
            this.hideAllZonesinCanvas();
            // this.unSetCanvas();
            this.toastr.success('The Zone has been successfully deleted');
            // this.initialLoader = false;
          }, 2500);
        }
        else {
          this.removeAllNewZonesInList();
          this.callZonesApi();
          this.hideAllZonesinCanvas();
          this.toastr.warning("Deletion of the zone was unsuccessful");
        }
      }
    )
  }

  unSetAllZonesfromMap() {
    this.fetchedPolygons.map((item: any) => {
      if (item?.poly) item?.poly?.setMap(null);
      if (item?.marker) item?.marker?.setMap(null);
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

    google.maps.event.addListener(this.drawingManager, 'polygoncomplete', (event: any) => {
      event?.getPath().getLength();
      this.setFreehandMode();
      if (this.listOfPolygons.length == 0) this.listOfPolygons.push({ id: this.listOfPolygons.length, polygon: event });
      if (this.listOfPolygons.length >= 1) this.maxLimitReached = true;
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
      })
      google.maps.event.addListener(event, 'dragend', this.getPolygonCoords)
      google.maps.event.addListener(event.getPath(), 'insert_at', () => {
        this.coordinates.splice(0, this.coordinates?.length);
        let len = event?.getPath().getLength();
        for (let i = 0; i < len; i++) {
          this.coordinates.push(event.getPath().getAt(i).toUrlValue(5))
        }
      })
      google.maps.event.addListener(event.getPath(), 'set_at', () => {
        this.coordinates.splice(0, this.coordinates?.length);
        let len = event?.getPath().getLength();
        for (let i = 0; i < len; i++) {
          this.coordinates.push(event.getPath().getAt(i).toUrlValue(5))
        }
      })
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
      this.listOfPolygons[this.listOfPolygons.length - 1] = null;
      this.shapeOverlay.setMap(null);

    }
    this.listOfPolygons.splice(0, this.listOfPolygons.length);
  }

  stopDrawing() {
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
        else if (status != "OK") this.toastr.error('Could not fetch the Location')
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

  makemkrs(position: any, title: any, loc_id: any, route_name: any,Address_Line_1:any,Address_Line_2:any,Dryers:any,Washers:any, Location_Name:any,City:any,Country:any) {
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
      this.infoWin.setContent(`<div class="grid-container-mkr" style="padding:10px;display: grid;
      grid-template-columns: auto auto;
      gap: 10px;
      padding: 10px;font-weight:400">
      <div>Location Number :</div>
      <div>${loc_id}</div>
      <div>Address :</div>
      <div>${(Address_Line_1) ? Address_Line_1 : ''} ${(Address_Line_2) ? Address_Line_2 : ''}, ${(City) ? City : ''}, ${Country ? Country : ''}</div>
      <div>Route :</div>  
      <div>${(route_name) ? route_name : 'Empty'} </div>
      <div>Dryers :</div>
      <div>${Dryers}</div>
      <div>Washers :</div>
      <div>${Washers}</div>
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

  logOut() {
    this.isMenuOpen = false;
    const dialogRef = this.dialog.open(ConfirmBoxComponent, {
      data: {
        message: 'Are you sure want to Logout?',
        logout: true,
      },
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed == true) {
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['']);
      }
    });
  }

  onBodyClick(event: any): void {
    if (!event.target.classList.contains('menu-backdrop')) {
      this.isMenuOpen = false;
    }
  }

}