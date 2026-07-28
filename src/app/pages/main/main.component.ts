import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ExampleService } from '@core/api/example/example.service';

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

  // Methods
  async ngOnInit(): Promise<void> {
    const response = await this.exampleService.getExample();
    console.log(response);
  }
}
