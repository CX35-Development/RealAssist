import { TestBed } from '@angular/core/testing';

import { RiaService } from './ria.service';

describe('RiaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RiaService = TestBed.get(RiaService);
    expect(service).toBeTruthy();
  });
});
