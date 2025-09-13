import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './components/header/header.component';
import { TransactionModalComponent } from './components/transaction-modal/transaction-modal.component';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts'; 

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderComponent,
    TransactionModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule, 
    FormsModule,
    NgApexchartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
