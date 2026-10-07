import { TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(FooterComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });
});
