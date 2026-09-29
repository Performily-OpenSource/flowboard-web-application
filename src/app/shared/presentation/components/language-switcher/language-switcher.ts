import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  imports: [],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  currentLanguage = 'en';
  languages = ['en', 'es'];

  constructor(private translate: TranslateService) {
    this.currentLanguage = translate.getCurrentLang() ?? 'en';
  }

  useLanguage(language: string) {
    this.translate.use(language);
    this.currentLanguage = language;
    document.documentElement.lang = language;
  }
}