import {
  type AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
} from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { TranslatePipe } from '@ngx-translate/core';
import { NgPipesModule } from 'ngx-pipes';

@Component({
  selector: 'app-header',
  imports: [NgPipesModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements AfterViewInit {
  // Injections
  private host = inject(ElementRef<HTMLElement>);
  public authService = inject(AuthService);

  // Methods
  public ngAfterViewInit(): void {
    this.updateHeight();
    window.addEventListener('resize', () => this.updateHeight());
  }

  private updateHeight(): void {
    const height = this.host.nativeElement.offsetHeight;
    document.documentElement.style.setProperty(
      '--header-height',
      `${height}px`,
    );
  }
}
