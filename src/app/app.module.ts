import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GoogleMapDemoComponent } from './google-map-demo/google-map-demo.component';
import { MapMarkerClusterer } from '@angular/google-maps';
import { StoreMapComponent } from './store-map/store-map.component';

@NgModule({
  declarations: [
    AppComponent,
    GoogleMapDemoComponent,
    StoreMapComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
