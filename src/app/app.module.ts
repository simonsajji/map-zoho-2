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
import { ToastrModule} from 'ngx-toastr';
import { ConfirmBoxComponent } from './confirm-box/confirm-box.component';
import { HttpClientModule } from '@angular/common/http';
import { TableviewComponent } from './tableview/tableview.component';
import { RouteviewComponent } from './routeview/routeview.component';
import { EditcolumnComponent } from './editcolumn/editcolumn.component';
import { LocationService } from './services/location.service';
import { NewterritoryformComponent } from './newterritoryform/newterritoryform.component';
import { RemovespacePipe } from './pipes/removespace.pipe';
import { RemovespecialPipe } from './pipes/removespecial.pipe';
import { DeletezoneconfirmComponent } from './deletezoneconfirm/deletezoneconfirm.component';

@NgModule({
  declarations: [
    AppComponent,
    StoreMapComponent,
    CustomDatePipe,
    TitlecasePipe,
    RemoveunderscorePipe,
    ConfirmBoxComponent,
    TableviewComponent,
    RouteviewComponent,
    EditcolumnComponent,
    NewterritoryformComponent,
    RemovespacePipe,
    RemovespecialPipe,
    DeletezoneconfirmComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MatSidenavModule,
    MaterialModule,
    GooglePlaceModule,
    ToastrModule.forRoot({
      positionClass :'toast-top-right',
      preventDuplicates: true
    }),
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
