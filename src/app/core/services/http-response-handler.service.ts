import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { type HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class HttpResponseHandlerService {
  // Injects
  private translate = inject(TranslateService);
  private toastr = inject(ToastrService);

  // Methods

  /**
   * Handles HTTP errors and shows translated messages
   * @param error - HTTP error received
   */
  public handleHttpError(error: HttpErrorResponse): void {
    const errorTag = error.error?.tag;
    const message = this.translateServerMessage(errorTag ?? 'default');
    this.toastr.error(message);
  }

  /**
   * Handles HTTP warnings and shows translated messages
   * @param error - HTTP warning received
   */
  public handleHttpWarning(warningTag: string): void {
    const message = this.translateServerMessage(warningTag, 'warning');
    this.toastr.warning(message);
  }

  /**
   * Handles success responses and shows translated messages
   * @param successTag - Success tag sent by server
   */
  public handleSuccessResponse(successTag: string = 'default'): void {
    const message = this.translateServerMessage(successTag, 'success');
    this.toastr.success(message);
  }

  /**
   * Handles session expired errors
   */
  public handleSessionExpired(): void {
    this.toastr.error(
      this.translate.instant('httpRequest.error.sessionExpired'),
    );
  }

  /**
   * Translates a tag from server using i18n
   * @param tag - Tag sent by server
   * @param type - Type of message (error or success)
   * @returns Translated message or default message if not found
   */
  private translateServerMessage(
    tag: string,
    type: 'error' | 'success' | 'warning' = 'error',
  ): string {
    const translationKey = `httpRequest.${type}.${tag}`;
    const translatedMessage = this.translate.instant(translationKey);

    // If translation equals the key, it means it wasn't found, return default
    if (translatedMessage === translationKey) {
      return this.translate.instant(`httpRequest.${type}.default`);
    }

    return translatedMessage;
  }
}
