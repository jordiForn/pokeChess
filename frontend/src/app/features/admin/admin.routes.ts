import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminPiecesComponent } from './admin-pieces/admin-pieces.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';

export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'users', component: AdminUsersComponent },
  { path: 'pieces', component: AdminPiecesComponent },
];
