import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MapModule } from './modules/map/map.module';
import { AuthGuardService as AuthGuard} from './services/auth-guard.service';

const routes: Routes = [
  // {
  //   path: 'map', loadChildren: () => MapModule,
  //   canActivate: [AuthGuard], data: { role: ['admin', 'register'] }
  // },
 
  { path: '', loadChildren: () => MapModule },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
