import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import {
  MatButtonModule,
  MatRippleModule,
  MatSnackBarModule,
  MatCardModule,
  MatIconModule,
  MatDialogModule,
  MatInputModule,
  MatListModule,
  MatDividerModule,
  MatToolbarModule,
  MatTableModule,
  MatPaginatorModule,
  MatProgressSpinnerModule,
  MatSortModule,
  MatMenuModule,
  MatExpansionModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatSelectModule,
  MatCheckboxModule,
  MatBadgeModule,
  MatProgressBarModule,
  MatButtonToggleModule
} from '@angular/material';

export const SHARED_MODULES = [
  FormsModule,
  ReactiveFormsModule,
  MatButtonModule,
  MatRippleModule,
  MatSnackBarModule,
  MatCardModule,
  MatIconModule,
  MatDialogModule,
  MatInputModule,
  MatListModule,
  MatDividerModule,
  MatToolbarModule,
  MatTableModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatSortModule,
  MatMenuModule,
  MatExpansionModule,
  MatChipsModule,
  MatAutocompleteModule,
  MatSelectModule,
  MatCheckboxModule,
  MatBadgeModule,
  MatButtonToggleModule,

  FlexLayoutModule
];

@NgModule({
  imports: [],
  exports: [...SHARED_MODULES]
})
export class SharedModule { }
