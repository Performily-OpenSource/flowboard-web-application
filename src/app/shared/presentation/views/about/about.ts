import {Component} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

/**
 * About view of the application.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-about',
  imports: [
    TranslatePipe
  ],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {}