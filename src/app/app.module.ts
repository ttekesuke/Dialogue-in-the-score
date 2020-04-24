import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { DropdownModule } from "primeng/dropdown";
import {InputTextModule} from 'primeng/inputtext';
import { ButtonModule } from "primeng/button";
import {KeyFilterModule} from 'primeng/keyfilter';
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    BrowserAnimationsModule,
    KeyFilterModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
