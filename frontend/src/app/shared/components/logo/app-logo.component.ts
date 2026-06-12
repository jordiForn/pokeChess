import { Component, computed, input } from '@angular/core';

type LogoVariant = 'icon' | 'full';
type LogoSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-logo',
  template: `<img [src]="src()" [alt]="alt()" [class]="classes()" />`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    img {
      display: block;
      object-fit: contain;
    }

    img.icon.sm {
      width: 1.25rem;
      height: 1.25rem;
    }

    img.icon.md {
      width: 2rem;
      height: 2rem;
    }

    img.icon.lg {
      width: 2.5rem;
      height: 2.5rem;
    }

    img.full {
      width: min(100%, 14rem);
      height: auto;
    }
  `,
})
export class AppLogoComponent {
  readonly variant = input<LogoVariant>('icon');
  readonly size = input<LogoSize>('md');
  readonly alt = input('PokeChess');

  protected readonly src = computed(() =>
    this.variant() === 'full' ? '/images/logo-full.png' : '/images/logo-icon.png',
  );

  protected readonly classes = computed(() =>
    this.variant() === 'full' ? 'full' : `icon ${this.size()}`,
  );
}
