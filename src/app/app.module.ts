import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapMarkerClusterer } from '@angular/google-maps';
import { StoreMapComponent } from './store-map/store-map.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material/material.module';
import { CustomDatePipe } from './pipes/date.pipe';
import { FormsModule } from '@angular/forms';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { TitlecasePipe } from './pipes/titlecase.pipe';
import { RemoveunderscorePipe } from './pipes/removeunderscore.pipe';


@NgModule({
  declarations: [
    AppComponent,
    StoreMapComponent,
    CustomDatePipe,
    TitlecasePipe,
    RemoveunderscorePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatSidenavModule,
    MaterialModule,
    GooglePlaceModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
