import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ExampleService } from '@core/api/example/example.service';
import type { GetExampleResponse } from '@core/api/example/example.types';

/**
 * Página de ejemplo del template: muestra el flujo completo
 * servicio API (`core/api/`) → signal → template con i18n.
 * Sustituir por la primera pantalla real de la aplicación.
 */
@Component({
  selector: 'app-main',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MainComponent implements OnInit {
  // Injections
  private exampleService = inject(ExampleService);

  // Data
  public example = signal<GetExampleResponse | null>(null);

  // Methods
  async ngOnInit(): Promise<void> {
    const response = await this.exampleService.getExample();
    this.example.set(response);
  }
}
