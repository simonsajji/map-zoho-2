import { LocationStrategy } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow } from '@angular/google-maps';
import MarkerClusterer from '@googlemaps/markerclustererplus';

@Component({
  selector: 'store-map',
  // template: `<div id="map" style="height: 100vh"></div>`,
  templateUrl: './store-map.component.html',
  styleUrls: ['./store-map.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreMapComponent implements OnInit,OnChanges {

  @ViewChild('map', {static: false}) info: ElementRef | undefined;
   labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   locations = [
    { location: new google.maps.LatLng(41.661129, -91.530169) , stopover:true }, // double
    { location: new google.maps.LatLng(41.661129, -91.530169) , stopover:true }, // double
    // { location: new google.maps.LatLng( 52.321945, -106.584167) , stopover:false }, //dest
    { location: new google.maps.LatLng(44.500000, -89.500000) , stopover:true },
    { location: new google.maps.LatLng(46.877186, -96.789803) , stopover:true },
    { location: new google.maps.LatLng(41.543056, -90.590836) , stopover:true }, // davenport
    { location: new google.maps.LatLng(43.167126,  -93.210754) , stopover:true }, // mason city
    { location: new google.maps.LatLng(37.871384,  -93.210754) , stopover:true }, // monticello
    { location: new google.maps.LatLng( 38.871384,  -93.210754) , stopover:true }, // 
    { location: new google.maps.LatLng(  47.925259,  -97.032852) , stopover:true }, // 
    { location: new google.maps.LatLng(  44.925259,  -96.032852) , stopover:true }, // 
    { location: new google.maps.LatLng(  44.825259,  -96.032852) , stopover:true }, // 
    { location: new google.maps.LatLng(  44.825259,  -96.132852) , stopover:true }, // 
    { location: new google.maps.LatLng(  44.925259,  -96.332852) , stopover:true }, // 
    { location: new google.maps.LatLng(  44.425259,  -96.232852) , stopover:true }, // 
    // { location: new google.maps.LatLng(  47.925259,  -93.032852) , stopover:true }, // 
    // { location: new google.maps.LatLng(  47.925259,  -95.032852) , stopover:true }, // 
    { location: new google.maps.LatLng(44.986656, -93.258133) , stopover:true },
    { location: new google.maps.LatLng(44.886656, -93.258133) , stopover:true },
    // { location: new google.maps.LatLng(44.786656, -93.158133) , stopover:true },
    // { location: new google.maps.LatLng(44.986656, -93.858133) , stopover:true },
    // { location: new google.maps.LatLng(44.086656, -93.258133) , stopover:true },
    // { location: new google.maps.LatLng(44.086656, -93.258133) , stopover:true },
    // { location: new google.maps.LatLng(44.9861656, -93.258133) , stopover:true },
    // { location: new google.maps.LatLng(44.906956, -93.858133) , stopover:true },
    // { location: new google.maps.LatLng(44.936056, -93.058133) , stopover:true },
    { location: new google.maps.LatLng(50.247038, -99.838649) , stopover:true }, //minnedosa
    // { location: new google.maps.LatLng(52.146973, -106.677034) , stopover:true },
    { location: new google.maps.LatLng(49.895077, -97.138451) , stopover:true }, // winnipeg //double
    // { location: new google.maps.LatLng(49.895077, -97.138451) , stopover:true }, // winnipeg  //double
    { location: new google.maps.LatLng(51.256973, -103.677034) , stopover:true },
    // { location: new google.maps.LatLng(51.146973, -105.427034) , stopover:true },
    // { location: new google.maps.LatLng(51.266973, -103.377034) , stopover:true },
    // { location: new google.maps.LatLng(51.246973, -106.577034) , stopover:true },
    // { location: new google.maps.LatLng(51.246973, -106.577034) , stopover:true },
    // { location: new google.maps.LatLng(40.000000, -89.000000) , stopover:false }, //orgin
  ];

  mkrs:any = [];
  shortestRte:google.maps.DirectionsRoute | any;
  map:any;
  directionsService = new google.maps.DirectionsService();
  directionsRenderer:any;
  stepDisplay = new google.maps.InfoWindow();
  showSliderMenu:boolean = false;
  showRoutes:boolean = false;
  result:any;
  rightanimationActive:boolean = false;
  leftanimationActive:boolean = false;
  totalDistance:any;
  totalDuration:any;
  infoWin :any= new google.maps.InfoWindow();

  ngOnInit() {
   
    this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        zoom: 3,
        center: { lat: 45.630001, lng: -73.519997},
      }
    )
    this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map,suppressMarkers:true});
    this.createRoute();
    
  }

  ngOnChanges(){
    // if(this.result.legs?.length>0) this.showRoutes = true;
    //     console.log(this.showRoutes);
  }

  makeMarker( position:any, icon:any, title:any,locObject:any ) {
    let  mkr = [];
    let label = title + "";
    console.log(position.lat());
    let obj = {lat:position.lat(),lng:position.lng()};
    if(icon=="start"){
        let marker = new google.maps.Marker({
          position: obj,
          map: this.map,
          icon: "assets/flag-start.png",
          label: label,
          title: title
        });

        google.maps.event.addListener(marker, 'click', (evt:any)=> {
          this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${label}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${locObject?.start_address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> Empty </i> </p>
                      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>Remove</div> <div>G Map</div> <div>Street View</div>  <div>Move</div><div>
                    </div>`);
          this.infoWin.open(this.map, marker);
        })
        mkr.push(marker);
          new MarkerClusterer(this.map, mkr, {
          imagePath:
            "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            
        });

    }
    else{
     
        let marker = new google.maps.Marker({
          position: obj,
          map: this.map,
          icon: "assets/flag-end.png",
          label: label,
          title: title
        });

        google.maps.event.addListener(marker, 'click', (evt:any)=> {
          this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${label}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${locObject?.start_address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> Empty </i> </p>
                      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>Remove</div> <div>G Map</div> <div>Street View</div>  <div>Move</div><div>
                    </div>`);
          this.infoWin.open(this.map, marker);
        })
        mkr.push(marker);
          new MarkerClusterer(this.map, mkr, {
          imagePath:
            "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            
        });
    }
  }

  makeWaypoints(position:any,title:any,locObject:any){
    let label = title + "";
    console.log(position.lat());
    let obj = {lat:position.lat(),lng:position.lng()}

    let marker = new google.maps.Marker({
      position: obj,
      map: this.map,
      label: label
     });

    google.maps.event.addListener(marker, 'click', (evt:any)=> {
      this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${label}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${locObject?.start_address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> Empty </i> </p>
      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>Remove</div> <div>G Map</div> <div>Street View</div>  <div>Move</div><div>
    </div>`);
      this.infoWin.open(this.map, marker);
    })
    this.mkrs.push(marker);
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
     
        this.directionsService.route({
          origin: "illinois",
          destination: { lat: 52.146973, lng: -106.677034},
          waypoints: waypoints,
          // waypoints: this.locations,
          optimizeWaypoints: true,
          provideRouteAlternatives: true,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        ((result:any,status:any) => {
          console.log(result);
          this.result = result;
          if(status=='OK') this.showRoutes = true;
          // document.getElementById("warnings-panel").innerHTML =
          //   "<b>" + result.routes[0].warnings + "</b>";
          var shortest: google.maps.DirectionsResult = this.shortestRoute(result);
          console.log(this.shortestRte);
          
          let legLength = result.routes[0].legs.length;
          this.directionsRenderer.setDirections(shortest); // shortest or result
          var leg = result.routes[0].legs[0];
          var leg2 = result.routes[0].legs[legLength -1]
          console.log(leg , leg2.end_location.lat())
          this.makeMarker( leg.start_location, "start", "title" ,leg);
          this.makeMarker( leg2.end_location, "end", 'title' ,leg2 );
          result?.routes[0]?.legs?.forEach((element:any,idx:any) => {
           if(idx !=0) this.makeWaypoints(element?.start_location,idx,element)    
          });
          this.makeClusters();
          this.computeTotalDistance(result);
          // showSteps(result, markerArray, stepDisplay, map);
        }))
      .catch((e:any) => {
        window.alert("Directions request failed due to " + e);
      });
    }
  }

  computeTotalDistance(result:any) {
    var totalDist = 0;
    var totalTime = 0;
    var myroute = result.routes[0];
    for (let i = 0; i < myroute.legs.length; i++) {
      totalDist += myroute.legs[i].distance.value;
      totalTime += myroute.legs[i].duration.value;
    }
    totalDist = totalDist / 1000.
    console.log( "total distance is: " + totalDist + " km<br>total time is: " + (totalTime / 60).toFixed(2) + " minutes");
    this.totalDistance = totalDist;
    this.totalDuration = this.secondsToDhms(totalTime.toFixed(2)) ;

  }

  secondsToDhms(seconds:any) {
    seconds = Number(seconds);
    var d = Math.floor(seconds / (3600*24));
    var h = Math.floor(seconds % (3600*24) / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 60);
    
    var dDisplay = d > 0 ? d + (d == 1 ? " d " : " d ") : "";
    var hDisplay = h > 0 ? h + (h == 1 ? " h " : " h ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " min " : " mins ") : "";
    var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return dDisplay + hDisplay + mDisplay ;
    }

  makeClusters(){
    console.log(this.mkrs)
    var mkrClusters = new MarkerClusterer(this.map, this.mkrs, {
      imagePath:
        "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
        
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

  toggleSlideMenu(){
    if(this.showSliderMenu){
        this.rightanimationActive = true;
        
        this.showSliderMenu = !this.showSliderMenu;
        setTimeout(()=>{
          
          this.rightanimationActive = false;
        },250);
    }
    else{
      this.leftanimationActive = true;
     
      this.showSliderMenu = !this.showSliderMenu;  
      setTimeout(()=>{
        
        this.leftanimationActive = false;
      },250);
    }
  }
}