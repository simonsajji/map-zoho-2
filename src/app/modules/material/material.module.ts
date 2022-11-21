import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatDialogModule } from "@angular/material/dialog";
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatListModule} from '@angular/material/list';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatRadioModule} from '@angular/material/radio';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSliderModule} from '@angular/material/slider';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NgxMaterialTimepickerModule
    
  ],
  exports:[
    MatTabsModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatRippleModule,
    MatNativeDateModule,
    NgxMaterialTimepickerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatButtonToggleModule,
    MatRadioModule,
    MatProgressBarModule,
    MatSliderModule
    

  ]
})
export class MaterialModule { }

