import { TestBed } from '@angular/core/testing';
import { LoaderService } from './loader.service';

describe('LoaderService', () => {
  let service: LoaderService;

  beforeEach(() => {
    service = TestBed.inject(LoaderService);
  });

  it('should not be loading by default', () => {
    expect(service.isLoading()).toBeFalse();
  });

  it('should be loading while there are active requests', () => {
    service.show();
    service.show();
    service.hide();

    expect(service.isLoading()).toBeTrue();
  });

  it('should stop loading when every request has finished', () => {
    service.show();
    service.hide();

    expect(service.isLoading()).toBeFalse();
  });

  it('should never go below zero active requests', () => {
    service.hide();
    service.show();

    expect(service.isLoading()).toBeTrue();
  });
});
