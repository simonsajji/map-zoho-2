import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MapMarkerClusterer } from '@angular/google-maps';
import { StoreMapComponent } from './modules/map/components/store-map/store-map.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './modules/material/material.module';
import { CustomDatePipe } from './pipes/date.pipe';
import { FormsModule } from '@angular/forms';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { TitlecasePipe } from './pipes/titlecase.pipe';
import { RemoveunderscorePipe } from './pipes/removeunderscore.pipe';
import { ToastrModule} from 'ngx-toastr';
import { ConfirmBoxComponent } from './modules/map/components/confirm-box/confirm-box.component';
import { TableviewComponent } from './modules/map/components/tableview/tableview.component';
import { RouteviewComponent } from './modules/map/components/routeview/routeview.component';
import { EditcolumnComponent } from './modules/map/components/editcolumn/editcolumn.component';
import { LocationService } from './services/location.service';
import { NewterritoryformComponent } from './modules/map/components/newterritoryform/newterritoryform.component';
import { RemovespacePipe } from './pipes/removespace.pipe';
import { RemovespecialPipe } from './pipes/removespecial.pipe';
import { DeletezoneconfirmComponent } from './modules/map/components/deletezoneconfirm/deletezoneconfirm.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { AuthGuardService } from './services/auth-guard.service';
import { Interceptor } from './interceptor/interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
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
    HttpClientModule,
    ColorPickerModule
  ],
  providers: [ AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
