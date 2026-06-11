import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminNavComponent } from '../shared/admin-nav/admin-nav.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [RouterLink, AdminNavComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {}
