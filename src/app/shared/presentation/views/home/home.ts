import {Component} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

/**
 * Home view (dashboard) of the application.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-home',
  imports: [
    TranslatePipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}