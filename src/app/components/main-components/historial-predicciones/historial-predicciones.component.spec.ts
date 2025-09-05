import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialPrediccionesComponent } from './historial-predicciones.component';

describe('HistorialPrediccionesComponent', () => {
  let component: HistorialPrediccionesComponent;
  let fixture: ComponentFixture<HistorialPrediccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialPrediccionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialPrediccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
