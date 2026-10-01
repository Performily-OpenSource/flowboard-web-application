import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../application/iam.store';
import {SessionStore} from '../../../../shared/application/session.store';
import {PlainPassword} from '../../../domain/model/plain-password';
import {LanguageSwitcher} from '../../../../shared/presentation/components/language-switcher/language-switcher';

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule, MatButton, MatIcon, TranslatePipe, LanguageSwitcher],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css'
})
export class ChangePassword {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly iam = inject(IamStore);
  readonly session = inject(SessionStore);
  readonly submitted = signal(false);
  readonly form = this.fb.nonNullable.group({
    temporaryPassword: ['', Validators.required],
    password: ['', Validators.required],
    repeatPassword: ['', Validators.required]
  });

  readonly requirements = signal<string[]>(PlainPassword.validate(''));

  updatePassword(value: string): void { this.requirements.set(PlainPassword.validate(value)); }

  async submit(): Promise<void> {
    this.submitted.set(true);
    const {temporaryPassword, password, repeatPassword} = this.form.getRawValue();
    if (this.form.invalid || password !== repeatPassword || this.requirements().length > 0) return;
    const ok = await this.iam.changeCurrentPassword(temporaryPassword, password);
    if (ok) await this.router.navigate(['/home']);
  }
}
