import { Component, input } from '@angular/core';
import { GameStats } from '../../models/game-stats.model';

@Component({
  selector: 'app-stats-summary',
  templateUrl: './stats-summary.component.html',
  styleUrl: './stats-summary.component.scss',
})
export class StatsSummaryComponent {
  readonly stats = input<GameStats | null>(null);
}
