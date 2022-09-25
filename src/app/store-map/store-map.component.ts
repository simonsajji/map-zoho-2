import { LocationStrategy } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core'
// import { Coordinates } from '@shared/models/coordinates.model';
import MarkerClusterer from '@googlemaps/markerclustererplus';
// import google fro 

@Component({
  selector: 'store-map',
  template: `<div id="map" style="height: 100vh"></div>`,
  styleUrls: ['./store-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreMapComponent implements AfterViewInit {

  @ViewChild('map', {static: false}) info: ElementRef | undefined;
   labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   locations = [
    { location: new google.maps.LatLng(41.661129, -91.530169) , stopover:true }, // double
    { location: new google.maps.LatLng(41.661129, -91.530169) , stopover:true }, // double
    // { location: new google.maps.LatLng( 52.321945, -106.584167) , stopover:false }, //dest
    { location: new google.maps.LatLng(44.500000, -89.500000) , stopover:true },
    { location: new google.maps.LatLng(46.877186, -96.789803) , stopover:true },
    { location: new google.maps.LatLng(43.167126,  -93.210754) , stopover:true }, // mason city

    { location: new google.maps.LatLng(44.986656, -93.258133) , stopover:true },
    
    { location: new google.maps.LatLng(52.146973, -106.677034) , stopover:true },
    { location: new google.maps.LatLng(49.895077, -97.138451) , stopover:true }, // winnipeg //double
    { location: new google.maps.LatLng(49.895077, -97.138451) , stopover:true }, // winnipeg  //double

    // { location: new google.maps.LatLng(40.000000, -89.000000) , stopover:false }, //orgin
     
  ];

  mkrs = [
    { lat: 41.661129, lng: -91.530167 },
    { lat: 46.877186, lng: -96.789803},
    { lat: 44.986656, lng: -93.258133},
    { lat: 44.500000, lng: -89.500000},
    { lat: 52.146973, lng: -106.677034},
    { lat: 49.895077,lng: -97.138451},


  ];

  shortestRte:google.maps.DirectionsRoute | any;
  map:any;

  ngAfterViewInit() {
   
    this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        zoom: 3,
        center: { lat: 45.630001, lng: -73.519997},
      }
    )
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map });
    const stepDisplay = new google.maps.InfoWindow();

    
    
    const markers = this.mkrs.map((location, i) => {
      return new google.maps.Marker({
        position: location,
        label: this.labels[i % this.labels.length],
      });
    });

    new MarkerClusterer(this.map, markers, {
      imagePath:
        "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
    });

    this.createRoute();

    // this.calculateAndDisplayRoute(directionsRenderer,directionsService,markers,stepDisplay,map);

  }



  createRoute(){
    for (var i = 0, parts = [], max = 25 - 1; i < this.locations.length; i = i + max){
      parts.push(this.locations.slice(i, i + max + 1));
    }

     // Send requests to service to get route (for stations count <= 25 only one request will be sent)
     for (var i = 0; i < parts.length; i++) {
        // Waypoints does not include first station (origin) and last station (destination)
        var waypoints = [];
        for (var j = 1; j < parts[i].length - 1; j++){
          waypoints.push(parts[i][j]);
        }
            
        // Service options
        var service_options = {
            origin: { lat: 41.661129, lng: -91.530167 },
            destination: { lat: 52.146973, lng: -106.677034},
            waypoints: waypoints,
            travelMode: 'DRIVING'
        };
        // Send request
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map });

        directionsService.route({
          origin: "illinois",
            destination: { lat: 52.146973, lng: -106.677034},
          waypoints: waypoints,
          optimizeWaypoints: true,
        provideRouteAlternatives: true,
        travelMode: google.maps.TravelMode.DRIVING,
      }).then((result:any) => {
        // Route the directions and pass the response to a function to create
        // markers for each step.
        // document.getElementById("warnings-panel").innerHTML =
        //   "<b>" + result.routes[0].warnings + "</b>";
        var shortest: google.maps.DirectionsResult = this.shortestRoute(result);
        // directionsRenderer.setDirections(shortest);
        directionsRenderer.setDirections(result);
        // showSteps(result, markerArray, stepDisplay, map);
      })
      .catch((e:any) => {
        window.alert("Directions request failed due to " + e);
      });
;
    }
  

  }

  calculateAndDisplayRoute(directionsRenderer:any,
    directionsService:any,
    markerArray:any,
    stepDisplay:any,
    map:any)
  {
     for (let i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }

  directionsService
      .route(
        {
        origin: { lat: 40.000000, lng: -89.000000},
        destination: { lat: 52.321945, lng: -106.584167},
        waypoints:this.locations,
        optimizeWaypoints: true,
        provideRouteAlternatives: true,
        travelMode: google.maps.TravelMode.DRIVING,
      })
      .then((result:any) => {
        // Route the directions and pass the response to a function to create
        // markers for each step.
        // document.getElementById("warnings-panel").innerHTML =
        //   "<b>" + result.routes[0].warnings + "</b>";
        var shortest: google.maps.DirectionsResult = this.shortestRoute(result);
        directionsRenderer.setDirections(shortest);
        // showSteps(result, markerArray, stepDisplay, map);
      })
      .catch((e:any) => {
        window.alert("Directions request failed due to " + e);
      });

  

  }

  shortestRoute(routeResults:google.maps.DirectionsResult | any){
    if(routeResults.routes[0]) this.shortestRte = routeResults.routes[0];
       if(this.shortestRte) var shortestLength = this.shortestRte.legs[0].distance.value;
        for (var i = 1; i < routeResults.routes.length; i++) {
            if (routeResults.routes[i].legs[0].distance.value < shortestLength) {
                this.shortestRte = routeResults.routes[i];
                shortestLength = routeResults.routes[i].legs[0].distance.value;
            }
        }
        routeResults.routes = [this.shortestRte];
        return routeResults;
  }
}