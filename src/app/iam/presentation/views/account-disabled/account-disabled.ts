import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import {LanguageSwitcher} from '../../../../shared/presentation/components/language-switcher/language-switcher';

/**
 * Presents the page shown when an account cannot access the application.
 *
 * @remarks Provides the disabled-account experience and navigation back to the public login flow.
 * @author Dario Avila de la cruz
 */
@Component({
  selector: 'app-account-disabled',
  imports: [MatButton, MatIcon, TranslatePipe, LanguageSwitcher, RouterLink],
  templateUrl: './account-disabled.html',
  styleUrl: './account-disabled.css'
})
export class AccountDisabled {}
