import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SuperAdminDashboard } from '../../../core/models/admin.models';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  private readonly admin = inject(AdminService);

  dashboard?: SuperAdminDashboard;

  ngOnInit(): void {
    this.admin.dashboard().subscribe((dashboard) => (this.dashboard = dashboard));
  }
}
