import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AgendaComponent } from './components/agenda/agenda.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'agenda', component: AgendaComponent },
  { path: '**', redirectTo: 'login' }
];
