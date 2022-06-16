import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ViewJobPage } from './view-job.page';

const routes: Routes = [
  {
    path: '',
    component: ViewJobPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ViewJobPageRoutingModule {}
