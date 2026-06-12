import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '../../core/services/auth-state.service';
import { StatsService } from '../../core/services/stats.service';
import { UserStateService } from '../../core/services/user-state.service';
import { StatsSummaryComponent } from '../../shared/components/stats-summary/stats-summary.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AppLogoComponent } from '../../shared/components/logo/app-logo.component';

@Component({
  selector: 'app-home',
  imports: [RouterLink, StatsSummaryComponent, IconComponent, AppLogoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly authState = inject(AuthStateService);
  private readonly statsService = inject(StatsService);
  private readonly userState = inject(UserStateService);

  protected readonly user = this.authState.user;
  protected readonly isAdmin = this.authState.isAdmin;
  protected readonly stats = this.userState.stats;

  ngOnInit(): void {
    this.statsService.loadStats().subscribe();
  }
}
