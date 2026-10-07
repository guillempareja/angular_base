import {
  ChangeDetectionStrategy,
  Component,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'global-loader',
  imports: [TranslatePipe],
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalLoaderComponent implements OnInit, OnDestroy {
  ngOnInit(): void {
    // Disable focus & interaction behind the overlay
    document.body.inert = true;
    // Prevent scroll while loading
    document.documentElement.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.inert = false;
    document.documentElement.style.overflow = '';
  }
}
