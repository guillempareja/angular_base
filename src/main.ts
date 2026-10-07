import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { enableMocking } from './fake-backend/enable-mocking';

registerLocaleData(localeEs, 'es-ES');

async function initializeApp() {
  // MSW must intercept before the first request is fired
  await enableMocking();

  // Bootstrap the application
  const appRef = await bootstrapApplication(AppComponent, appConfig);

  // Initialize translations after app is bootstrapped
  const translateService = appRef.injector.get(TranslateService);
  await firstValueFrom(translateService.use('es'));

  return appRef;
}

initializeApp().catch((err) => console.error(err));
