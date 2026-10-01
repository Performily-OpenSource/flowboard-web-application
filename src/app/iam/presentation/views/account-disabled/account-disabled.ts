import {Component} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {RouterLink} from '@angular/router';
import {LanguageSwitcher} from '../../../../shared/presentation/components/language-switcher/language-switcher';

@Component({
  selector: 'app-account-disabled',
  imports: [MatButton, MatIcon, TranslatePipe, LanguageSwitcher, RouterLink],
  templateUrl: './account-disabled.html',
  styleUrl: './account-disabled.css'
})
export class AccountDisabled {}
