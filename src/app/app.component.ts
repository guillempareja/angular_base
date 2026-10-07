import {
  ChangeDetectionStrategy,
  Component,
  inject,
  type OnInit,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { AuthService } from '@core/services/auth.service';
import { GlobalLoaderComponent } from '@shared/components/global-loader/global-loader.component';
import { LoaderService } from '@core/services/loader.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    GlobalLoaderComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  // Injections
  private authService = inject(AuthService);
  public loaderService = inject(LoaderService);

  // Methods
  public ngOnInit(): void {
    this.authService.loadSession();
  }
}
