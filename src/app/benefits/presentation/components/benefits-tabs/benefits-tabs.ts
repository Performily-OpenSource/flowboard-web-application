import {Component} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

/** Tabs shared by the benefits views: catalog, assignments, deliveries and balance per employee. */
@Component({
  selector: 'app-benefits-tabs',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './benefits-tabs.html',
})
export class BenefitsTabs {
  readonly tabs = [
    { link: '/benefits/catalog', label: 'benefits.tabs.catalog' },
    { link: '/benefits/assignments', label: 'benefits.tabs.assignments' },
    { link: '/benefits/deliveries', label: 'benefits.tabs.deliveries' },
    { link: '/benefits/balances', label: 'benefits.tabs.balances' }
  ];
}
