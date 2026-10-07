import { inject, Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class FormService {
  // Injections
  private toastr = inject(ToastrService);
  private translate = inject(TranslateService);

  // Methods
  public navigateToFormError(): void {
    const invalidElement = document.querySelector('.ng-invalid');

    if (invalidElement) {
      invalidElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      this.toastr.error(this.translate.instant('form.globalError'));
    }
  }
}
