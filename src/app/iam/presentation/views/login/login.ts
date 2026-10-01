import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {MatButton} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {LanguageSwitcher} from '../../../../shared/presentation/components/language-switcher/language-switcher';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatIcon, MatButton, TranslatePipe, RouterLink, LanguageSwitcher],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly iam = inject(IamStore);

  readonly submitted = signal(false);
  readonly showPassword = signal(false);
  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  togglePassword(): void { this.showPassword.update(value => !value); }

  async submit(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const result = await this.iam.authenticate(this.form.controls.username.value, this.form.controls.password.value);
    if (result === 'disabled') {
      await this.router.navigate(['/account-disabled']);
      return;
    }
    if (result === 'invalid') return;
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (this.iam.accounts().find(a => a.employeeEmail === this.form.controls.username.value)?.mustChangePassword) {
      await this.router.navigate(['/change-password']);
      return;
    }
    await this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/home');
  }
}
