import { LocationStrategy } from '@angular/common';
import {  ChangeDetectionStrategy, Component, ElementRef, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MapInfoWindow } from '@angular/google-maps';
import MarkerClusterer from '@googlemaps/markerclustererplus';
import { isThisSecond } from 'date-fns';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'store-map',
  // template: `<div id="map" style="height: 100vh"></div>`,
  templateUrl: './store-map.component.html',
  styleUrls: ['./store-map.component.css']
})
export class StoreMapComponent implements OnInit {

  @ViewChild('map', {static: false}) info: ElementRef | undefined;
   labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
   locations = [
    // { location: new google.maps.LatLng(41.661129, -91.530169) , stopover:true,title: {start_address : '102 Monto street canada',locationId:10}}, // double
    { location: new google.maps.LatLng(41.661129, -91.530169) , stopover:true,title: {start_address : '1 S Gilbert St, Iowa City, IA 52240, USA',locationId:12} }, // double
    // { location: new google.maps.LatLng( 52.321945, -106.584167) , stopover:false }, //dest
    { location: new google.maps.LatLng(44.500000, -89.500000) , stopover:true,title: {start_address : '5687-5749 County Rd HH, Stevens Point, WI 54482, USA',locationId:10} },
    { location: new google.maps.LatLng(46.877186, -96.789803) , stopover:true,title: {start_address : '4330 with ave s, apt 310, Fargo, ND 58102, USA',locationId:17} },
    { location: new google.maps.LatLng(41.543056, -90.590836) , stopover:true,title: {start_address : '2301 N Marquette St, Davenport, IA 52804, USA',locationId:13} }, // davenport
    { location: new google.maps.LatLng(43.167126,  -93.210754) , stopover:true ,title: {start_address : '1517 N Quincy Ave, Mason City, IA 50401, USA',locationId:1}}, // mason city
    // { location: new google.maps.LatLng(37.871384,  -93.210754) , stopover:true ,title: {start_address : '102 Monto street canada',locationId:3}}, // monticello
    { location: new google.maps.LatLng(  47.925259,  -97.032852) , stopover:true,title: {start_address : '215 S 3rd St #100, Grand Forks, ND 58201, USA',locationId:4} }, // 
    { location: new google.maps.LatLng(  44.925259,  -96.032852) , stopover:true,title: {start_address : '3038 180th St, Dawson, MN 56232, USA',locationId:18} }, // 
    { location: new google.maps.LatLng(  44.825259,  -96.032852) , stopover:true,title: {start_address : '305th Ave, Dawson, MN 56232, USA',locationId:7} }, // 
    { location: new google.maps.LatLng(  44.825259,  -96.132852) , stopover:true,title: {start_address : 'Co Rd 21, Dawson, MN 56232, USA',locationId:6} }, // 
    { location: new google.maps.LatLng(  44.925259,  -96.332852) , stopover:true ,title: {start_address : '161st Ave, Marietta, MN 56257, USA',locationId:2}}, // 
    { location: new google.maps.LatLng(  44.425259,  -96.232852) , stopover:true ,title: {start_address : 'Co Rd 126, Ivanhoe, MN 56142, USA',locationId:11}}, // 
    // { location: new google.maps.LatLng(  47.925259,  -93.032852) , stopover:true }, // 
    // { location: new google.maps.LatLng(  47.925259,  -95.032852) , stopover:true }, // 
    { location: new google.maps.LatLng(44.986656, -93.258133) , stopover:true ,title: {start_address : '15 SE Main St, Minneapolis, MN 55414, USA',locationId:14}},
    { location: new google.maps.LatLng(44.886656, -93.258133) , stopover:true ,title: {start_address : '6410 12th Ave S, Minneapolis, MN 55423, USA',locationId:15}},
    // { location: new google.maps.LatLng(44.786656, -93.158133) , stopover:true },
    // { location: new google.maps.LatLng(44.986656, -93.858133) , stopover:true },
    // { location: new google.maps.LatLng(44.086656, -93.258133) , stopover:true },
    // { location: new google.maps.LatLng(44.086656, -93.258133) , stopover:true },
    // { location: new google.maps.LatLng(44.9861656, -93.258133) , stopover:true },
    // { location: new google.maps.LatLng(44.906956, -93.858133) , stopover:true },
    // { location: new google.maps.LatLng(44.936056, -93.058133) , stopover:true },
    { location: new google.maps.LatLng(50.247038, -99.838649) , stopover:true ,title: {start_address : '42 Armitage Ave, Minnedosa, MB R0J 1E0, Canada',locationId:16}}, //minnedosa
    // { location: new google.maps.LatLng(52.146973, -106.677034) , stopover:true },
    { location: new google.maps.LatLng(49.895077, -97.138451) , stopover:true ,title: {start_address : '360-384 Main St, Winnipeg, MB R3C 4T3, Canada',locationId:19}}, // winnipeg //double
    // { location: new google.maps.LatLng(49.895077, -97.138451) , stopover:true }, // winnipeg  //double
    { location: new google.maps.LatLng(51.256973, -103.677034) , stopover:true ,title: {start_address : 'Unnamed Road, Kelliher, SK S0A 1V0, Canada',locationId:9}},
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
  wayPoints:any = [];
  shortestResult: google.maps.DirectionsResult |any ;
  pinSideMenu:boolean = false;
  displayDate: any;
  currentDate:any;
  displayTime:any;
  currentTime:any;
  @ViewChild('timepicker') timepicker:any;
  isOpen:any;
  formattedaddress=" ";
  options:any ={
    componentRestrictions:{
    country:["CA"]
    }
  };
  origin:any = "Illinois";
  destination:any = "Saskatoon";
  originMkr:any;
  destMkr:any;
  startstopmkr:any;
  isHomesetasCurrent:boolean = false;
  isHomesetasDefault:boolean = true;
  isHomesetasFavourite:boolean = false;
  isHomesetasEditedLocation:boolean = false;
  isEndsetasCurrent:boolean = false;
  isEndsetasDefault:boolean = true;
  isEndsetasFavourite:boolean = false;
  isEndsetasEditedLocation:boolean = false;


  ngOnInit() {
    // this. 
    this.currentDate = new Date();
    this.currentTime = new Date();
    this.displayTime = this.formatAMPM(new Date());
    this.displayDate = new Date();
    this.map = new google.maps.Map(document.getElementById("map") as HTMLElement, {
        zoom: 5,
        center: { lat: 45.630001, lng: -79.519997},
      }
    )
    this.directionsRenderer = new google.maps.DirectionsRenderer({ map: this.map,suppressMarkers:true});
    // this.createRoute();
    this.locations.map((location)=>{
      this.makemkrs(location?.location,location?.title)
    });
    this.makeClusters();
    // this.buildRoute();
  }

  


  public AddressChange(address: any) {
    this.formattedaddress = address.formatted_address;
    console.log(this.formattedaddress);
    // this.map.setCenter({lat:45.6,lng: 47.75})
    // this.map.setCenter(new google.maps.LatLng(-123.6, 47.75));

    const geocoder = new google.maps.Geocoder();
        geocoder.geocode(
            {
                address: this.formattedaddress
            },
            (results:any, status:any) => {
              console.log(status)
                if (status === "OK" && results.length > 0) {
                    const firstResult = results[0].geometry;
                    const bounds = new google.maps.LatLngBounds();
                    console.log(bounds)

                    if (firstResult.viewport) {
                        // Only geocodes have viewport.
                        bounds.union(firstResult.viewport);
                    } else {
                        bounds.extend(firstResult.location);
                    }

                    this.map.fitBounds(bounds);
                }
            }
        );
    }

    setHomeasCurrentLoc(){
      // remove the origin marker 
      this.isHomesetasCurrent = true;
      this.isHomesetasDefault = false;
      this.isHomesetasEditedLocation = false;
      this.isHomesetasFavourite = false;
      this.startstopmkr = [];
      // this.originMkr.setMap(null);
      this.origin = "St. Loius";
      // this.buildRoute();
    }
    setEndasCurrentLoc(){
      this.isEndsetasCurrent = true;
      this.isEndsetasDefault = false;
      this.isEndsetasEditedLocation = false;
      this.isEndsetasFavourite = false;
      this.startstopmkr = [];
      // this.destMkr.setMap(null);
      this.destination = "Edmonton";
      // this.buildRoute();
    }

 
  
 formatAMPM(date:any) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  let strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

  dateChange(event:any): void {
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

  onTimeset(ev:any){
    let time = ev?.value || ev;
    console.log(ev);
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


  makeMarker( position:any, icon:any, title:any,locObject:any ) {
    this.startstopmkr = [];
    let label = title + "";
    console.log(position.lat());
    let obj = {lat:position.lat(),lng:position.lng()};
    if(icon=="start"){
        this.originMkr = new google.maps.Marker({
          position: obj,
          map: this.map,
          icon: "assets/flag-start.png",
          label: title,
          title: title
        });

        google.maps.event.addListener(this.originMkr, 'click', (evt:any)=> {
          this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${label}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${locObject?.start_address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> Empty </i> </p>
                      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>Remove</div> <div>G Map</div> <div>Street View</div>  <div>Move</div><div>
                    </div>`);
          this.infoWin.open(this.map, this.originMkr);
        });
        this.originMkr.setMap(this.map)
        this.startstopmkr.push(this.originMkr);
          new MarkerClusterer(this.map, this.startstopmkr, {
          imagePath:
            "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            
        });

    }
    else{
        this.destMkr = new google.maps.Marker({
          position: obj,
          map: this.map,
          icon: "assets/flag-end.png",
          label: label,
          title: title
        });

        google.maps.event.addListener(this.destMkr, 'click', (evt:any)=> {
          this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${label}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${locObject?.start_address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> Empty </i> </p>
                      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>Remove</div> <div>G Map</div> <div>Street View</div>  <div>Move</div><div>
                    </div>`);
          this.infoWin.open(this.map, this.destMkr);
        })
        this.destMkr.setMap(this.map);
        this.startstopmkr.push(this.destMkr);
        new MarkerClusterer(this.map, this.startstopmkr, {
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

  makemkrs(position:any,title:any){
    let label = title + "";
    console.log(position.lat());
    let obj = {lat:position.lat(),lng:position.lng()}

    let marker = new google.maps.Marker({
      position: obj,
      map: this.map,
      label: title?.LocationId
     });

    google.maps.event.addListener(marker, 'click', (evt:any)=> {
      this.infoWin.setContent(`<div style= "padding:10px"> <p style="font-weight:400;font-size:13px">Location &emsp;  : &emsp; ${title?.LocationId}  <p> <p style="font-weight:400;font-size:13px"> Address  &emsp;  : &emsp; ${title?.start_address} </p> <p style="font-weight:400;font-size:13px"> Route  &emsp;&emsp;  : &emsp;  <i> Empty </i> </p>
      <div style="display:flex;align-items:center; justify-content:center;flex-wrap:wrap; gap:5%; color:rgb(62, 95, 214);font-weight:400;font-size:12px" > <div>Remove</div> <div>G Map</div> <div>Street View</div>  <div>Move</div><div>
    </div>`);
      this.infoWin.open(this.map, marker);
    })
    this.mkrs.push(marker);
  }

  buildRoute(){    
    this.wayPoints = this.locations.map((loc)=>{
      let obj = {location:loc?.location,stopover:true}
      return obj;
    });
   
    this.directionsService.route({
      origin: this.origin,
      destination: this.destination,
      waypoints: this.wayPoints,
      // waypoints: this.locations,
      optimizeWaypoints: true,
      provideRouteAlternatives: true,
      travelMode: google.maps.TravelMode.DRIVING,
    },
      ((result:any,status:any) => {
        console.log(result);
        this.result = result;

        if(status=='OK'){
          this.shortestResult = this.shortestRoute(this.result);
          
         
          console.log(this.result.routes[0])
          console.log(this.shortestRte);
          let legLength = this.result.routes[0].legs.length;
          var leg = this.result.routes[0].legs[0];
          var leg2 = this.result.routes[0].legs[legLength -1];
          console.log(leg , leg2.end_location.lat())
          this.makeMarker( leg.start_location, "start", "title" ,leg);
          this.makeMarker( leg2.end_location, "end", 'title' ,leg2 );
          this.computeTotalDistance(this.result);          
          this.directionsRenderer?.setDirections(this.shortestResult,()=>this.showRoutes = true); // shortest or result
          this.showRoutes = true; 
        }
      })).then(()=>{
        // this.renderRoute();
        // this.showRoutes = true;
      })
      .catch((e:any) => {
        window.alert("Directions request failed due to " + e);
        this.showRoutes = true;
      })
        
      
  }

  markLocations(){
    for (var i = 0, parts = [], max = 25 - 1; i < this.locations.length; i = i + max){
      parts.push(this.locations.slice(i, i + max + 1));
      }
    // Send requests to service to get route (for stations count <= 25 only one request will be sent)
     for (var i = 0; i < parts.length; i++) {
        // Waypoints does not include first station (origin) and last station (destination)
        for (var j = 1; j < parts[i].length - 1; j++){
          this.wayPoints.push(parts[i][j]);
        }
     }
  }

  createRoute(){
    this.markLocations();
    this.directionsService.route({
      origin: "illinois",
      destination: { lat: 52.146973, lng: -106.677034},
      waypoints: this.wayPoints,
      // waypoints: this.locations,
      optimizeWaypoints: true,
      provideRouteAlternatives: true,
      travelMode: google.maps.TravelMode.DRIVING,
    },
      ((result:any,status:any) => {
        console.log(result);
        this.result = result;
        if(status=='OK'){
          
          // document.getElementById("warnings-panel").innerHTML =
          //   "<b>" + result.routes[0].warnings + "</b>";
          this.shortestResult = this.shortestRoute(this.result);
          console.log(this.shortestRte);
          let legLength = this.result.routes[0].legs.length;
          var leg = this.result.routes[0].legs[0];
          var leg2 = this.result.routes[0].legs[legLength -1]
          console.log(leg , leg2.end_location.lat())
          this.makeMarker( leg.start_location, "start", "title" ,leg);
          this.makeMarker( leg2.end_location, "end", 'title' ,leg2 );
          this.result?.routes[0]?.legs?.forEach((element:any,idx:any) => {
          if(idx !=0) this.makeWaypoints(element?.start_location,idx,element)    
          });
          this.makeClusters();
          this.computeTotalDistance(this.result);
          // showSteps(result, markerArray, stepDisplay, map);
          // this.renderRoute();
        }
      }))
      .catch((e:any) => {
        window.alert("Directions request failed due to " + e);
      });
      
  }

  renderRoute(){
    this.directionsRenderer?.setDirections(this.shortestResult); // shortest or result
     this.showRoutes = true;
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
        this.showRoutes = true;
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