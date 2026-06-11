import { Component, inject } from '@angular/core';
import { PieceInventoryService } from '../../../../core/services/piece-inventory.service';

@Component({
  selector: 'app-piece-inventory-panel',
  templateUrl: './piece-inventory-panel.component.html',
  styleUrl: './piece-inventory-panel.component.scss',
})
export class PieceInventoryPanelComponent {
  private readonly inventory = inject(PieceInventoryService);

  protected readonly capturedByWhite = this.inventory.capturedByWhite;
  protected readonly capturedByBlack = this.inventory.capturedByBlack;
}
