import {Component, input} from '@angular/core';
import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {BenefitUnit} from '../../../domain/model/benefit-type.entity';

/** Shows a quantity with the unit of its benefit type: S/ 300.00, 2 días, 1 unidad. */
@Component({
  selector: 'app-benefit-quantity',
  imports: [CurrencyPipe, DecimalPipe, TranslatePipe],
  template: `
    @if (unit() === 'MONEY') {
      {{ quantity() | currency: 'PEN' : 'S/ ' }}
    } @else {
      {{ quantity() | number: '1.0-2' }} {{ ('benefits.unit-short.' + (unit() ?? 'UNITS')) | translate }}
    }
  `,
})
export class BenefitQuantity {
  readonly quantity = input.required<number>();
  readonly unit = input.required<BenefitUnit | null | undefined>();
}
