import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

import { AdminUsuariosComponent } from './pages/admin-usuarios/admin-usuarios.component';
import { FormularioPageComponent } from './pages/formulario-page/formulario-page.component';
import { HistorialPageComponent } from './pages/historial-page/historial-page.component';
import { ChatPageComponent } from './pages/chat-page/chat-page.component';


export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'admin-usuarios',
    component: AdminUsuariosComponent,
    canActivate: [authGuard],
    data: {
      roles: ["ADMIN", "GPLANEAMIENTO"],
    },
  },
  {
    path: 'menu',
    component: FormularioPageComponent,
    canActivate: [authGuard]
  },
  {
    path: 'historial',
    component: HistorialPageComponent,
    canActivate: [authGuard]
  },
  {
    path: 'chat',
    component: ChatPageComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
