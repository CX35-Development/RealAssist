import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CreateaccountPage } from './createaccount.page';

const routes: Routes = [
  {
    path: '',
    component: CreateaccountPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CreateaccountPageRoutingModule {}
