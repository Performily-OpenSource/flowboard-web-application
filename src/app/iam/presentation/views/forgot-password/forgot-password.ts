import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcher} from '../../../../shared/presentation/components/language-switcher/language-switcher';

/**
 * Presents the forgotten-password help page.
 *
 * @remarks Passwords are reset by Human Resources, so this view explains how to request a temporary password and links back to the sign-in form.
 * @author Dario Avila de la cruz
 */
@Component({
  selector: 'app-forgot-password',
  imports: [MatButton, MatIcon, TranslatePipe, LanguageSwitcher, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {}
