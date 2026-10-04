import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

/**
 * "EN / ES" switcher of the toolbar.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-language-switcher',
  imports: [],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  /** Language in use. */
  currentLanguage = 'en';
  /** Available languages. */
  languages = ['en', 'es'];

  /**
   * Creates the switcher with the language currently in use.
   *
   * @param translate - ngx-translate service.
   * @author Oscar Lizandro Vasquez Llave
   */
  constructor(private translate: TranslateService) {
    this.currentLanguage = translate.getCurrentLang() ?? 'en';
  }

  /**
   * Changes the language of the application and of the document.
   *
   * @param language - Language code ('en' or 'es').
   * @author Oscar Lizandro Vasquez Llave
   */
  useLanguage(language: string) {
    this.translate.use(language);
    this.currentLanguage = language;
    document.documentElement.lang = language;
  }
}