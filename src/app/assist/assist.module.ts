import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssistPageRoutingModule } from './assist-routing.module';

import { AssistPage } from './assist.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssistPageRoutingModule
  ],
  declarations: [AssistPage]
})
export class AssistPageModule {}
