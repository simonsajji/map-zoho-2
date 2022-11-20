import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreMapComponent } from 'src/app/modules/map/components/store-map/store-map.component';
import { CustomDatePipe } from 'src/app/pipes/date.pipe';
import { TitlecasePipe } from 'src/app/pipes/titlecase.pipe';
import { RemoveunderscorePipe } from 'src/app/pipes/removeunderscore.pipe';
import { ConfirmBoxComponent } from 'src/app/modules/map/components/confirm-box/confirm-box.component';
import { TableviewComponent } from 'src/app/modules/map/components/tableview/tableview.component';
import { RouteviewComponent } from 'src/app/modules/map/components/routeview/routeview.component';
import { EditcolumnComponent } from 'src/app/modules/map/components/editcolumn/editcolumn.component';
import { NewterritoryformComponent } from 'src/app/modules/map/components/newterritoryform/newterritoryform.component';
import { RemovespacePipe } from 'src/app/pipes/removespace.pipe';
import { RemovespecialPipe } from 'src/app/pipes/removespecial.pipe';
import { DeletezoneconfirmComponent } from 'src/app/modules/map/components/deletezoneconfirm/deletezoneconfirm.component';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { RouterModule, Routes } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { ColorPickerModule } from 'ngx-color-picker';
import { AuthGuardService as AuthGuard } from 'src/app/services/auth-guard.service';
import { MaphomeComponent } from './components/maphome/maphome.component';

const routes: Routes = [
  {
    path: '', component: MaphomeComponent, canActivate: [AuthGuard], data: { role: ['admin', 'receiver'] },
    children: [
      { path: '', component: StoreMapComponent, canActivate: [AuthGuard], data: { role: ['admin', 'receiver'] } },
      { path: '', component: TableviewComponent, canActivate: [AuthGuard], data: { role: ['admin', 'receiver'] } },
      { path: '', component: RouteviewComponent, canActivate: [AuthGuard], data: { role: ['admin', 'receiver'] } },
    ]
  },
 
  { path: '**', redirectTo: '', pathMatch: 'full' }]

@NgModule({
  declarations: [
    StoreMapComponent,
    ConfirmBoxComponent,
    TableviewComponent,
    RouteviewComponent,
    EditcolumnComponent,
    NewterritoryformComponent,
    DeletezoneconfirmComponent,
    CustomDatePipe,
    TitlecasePipe,
    RemoveunderscorePipe,
    RemovespacePipe,
    RemovespecialPipe,
    MaphomeComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    GooglePlaceModule,
    RouterModule.forChild(routes),
    ToastrModule.forRoot({
      positionClass :'toast-top-right'
    }),
    HttpClientModule,
    ColorPickerModule
      
  ]
})
export class MapModule { }
