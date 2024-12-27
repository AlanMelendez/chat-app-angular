import { Routes } from '@angular/router';
import { MeseroComponent } from './mesero/mesero.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
  {
    path: 'mesero',
    component: MeseroComponent
  },
  {
    path: 'cliente',
    component: ChatComponent
  },
  {
    path: '',
    redirectTo: '/cliente',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/cliente',
  }
];
