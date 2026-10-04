import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

/**
 * View shown when the route does not exist.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-page-not-found',
  imports: [
    TranslatePipe,
    MatButton,
    MatIcon
  ],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css',
})
export class PageNotFound implements OnInit {
  /** Path that was not found. */
  protected invalidPath: string = '';
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);

  /**
   * Reads the path that was not found.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  ngOnInit(): void {
    this.invalidPath = this.route.snapshot.url.map(url => url.path).join('/');
  }

  /**
   * Goes back to the home view.
   *
   * @author Oscar Lizandro Vasquez Llave
   */
  protected navigateToHome() {
    this.router.navigate(['home']).then();
  }
}