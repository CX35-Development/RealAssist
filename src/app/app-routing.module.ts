import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'home/login',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
    },
    {
        path: 'assist',
        loadChildren: () => import('./assist/assist.module').then(m => m.AssistPageModule)
    },
    {
        path: 'home/create-account',
        loadChildren: () => import('./createaccount/createaccount.module').then(m => m.CreateaccountPageModule)
    },
    {
        path: 'home/login',
        loadChildren: () => import('./login/login.module').then(m => m.LoginPageModule)
    },
    {
        path: 'agents',
        loadChildren: () => import('./agents/agents.module').then(m => m.AgentsPageModule)
    },
    {
        path: 'account',
        loadChildren: () => import('./account/account.module').then(m => m.AccountPageModule)
    },
    {
        path: 'view-job',
        loadChildren: () => import('./view-job/view-job.module').then(m => m.ViewJobPageModule)
    },
    {
        path: 'create-request',
        loadChildren: () => import('./create-request/create-request.module').then(m => m.CreateRequestPageModule)
    },
    {
        path: 'map',
        loadChildren: () => import('./map/map.module').then(m => m.MapPageModule)
    },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
