import {
  ChangeDetectionStrategy,
  Component,
  inject,
  type OnInit,
} from '@angular/core';
import {
  FormBuilder,
  type FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IsInvalidControlPipe } from '@shared/pipes/is-invalid-control.pipe';
import { ErrorMessagePipe } from '@shared/pipes/error-message.pipe';
import { markAllControlsAsTouched } from '@shared/utils/form.utils';
import { AuthService } from '@core/services/auth.service';
import { FormService } from '@shared/services/form.service';
import { sleep } from '@shared/utils/delay.utils';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    IsInvalidControlPipe,
    TranslatePipe,
    ErrorMessagePipe,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent implements OnInit {
  // Injections
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private formService = inject(FormService);

  // Data
  public form!: FormGroup;

  // Methods
  public ngOnInit(): void {
    this.authService.logout();
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  public async handleLogin(): Promise<void> {
    markAllControlsAsTouched(this.form);

    if (!this.form.valid) {
      await sleep(); // Wait for the UI to render validation errors before scrolling
      this.formService.navigateToFormError();
      return;
    }

    void this.authService.login(this.form.value);
  }
}
