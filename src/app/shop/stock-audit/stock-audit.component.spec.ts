import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAuditComponent } from './stock-audit.component';

describe('StockAuditComponent', () => {
  let component: StockAuditComponent;
  let fixture: ComponentFixture<StockAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StockAuditComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StockAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
