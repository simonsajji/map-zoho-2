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

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
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
    MatNativeDateModule
  ]
})
export class MaterialModule { }

