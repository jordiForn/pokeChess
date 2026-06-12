import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-icon',
  template: `<i [class]="iconClass()" aria-hidden="true"></i>`,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
  `,
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly style = input<'solid' | 'regular'>('solid');

  protected readonly iconClass = computed(
    () => `fa-${this.style()} fa-${this.name()}`,
  );
}
