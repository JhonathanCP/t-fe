import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { ToolbarModule } from 'primeng/toolbar';
import { PanelModule } from 'primeng/panel';
import { BadgeModule } from 'primeng/badge';
import { ChipModule } from 'primeng/chip';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { PredictionInput } from '../../../models/logic/prediction-input.model';
import { PredictionOutputHabito } from '../../../models/logic/prediction-output-habito.model';
import { PredictionOutputPropension } from '../../../models/logic/prediction-output-propension.model';
import { PredictionInputService } from '../../../core/services/logic/prediction-input.service';
import { PredictionOutputHabitoService } from '../../../core/services/logic/prediction-output-habito.service';
import { PredictionOutputPropensionService } from '../../../core/services/logic/prediction-output-propension.service';
import { AuthService } from '../../../core/services/authentication/auth.service';
import { forkJoin } from 'rxjs';

interface HistorialItem {
  predictionInput: PredictionInput;
  habitoOutput: PredictionOutputHabito | null;
  propensionOutput: PredictionOutputPropension | null;
  fecha: Date;
}

@Component({
  selector: 'app-historial-predicciones',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    ProgressSpinnerModule,
    CalendarModule,
    InputTextModule,
    ToolbarModule,
    PanelModule,
    BadgeModule,
    ChipModule
  ],
  templateUrl: './historial-predicciones.component.html',
  styleUrl: './historial-predicciones.component.scss'
})
export class HistorialPrediccionesComponent implements OnInit {
  historialItems: HistorialItem[] = [];
  loading = false;
  userId: number | null = null;
  
  // Filtros
  searchValue: string = '';
  rangeDates: Date[] = [];

  constructor(
    private predictionInputService: PredictionInputService,
    private habitoService: PredictionOutputHabitoService,
    private propensionService: PredictionOutputPropensionService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getUserId();
    this.loadHistorial();
  }

  getUserId() {
    const accessToken = this.authService.accessToken;
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        this.userId = payload.idUser || payload.id || payload.sub;
        if (this.userId && !isNaN(Number(this.userId))) {
          this.userId = Number(this.userId);
        } else {
          this.userId = null;
        }
      } catch (error) {
        console.error('Error al obtener user ID:', error);
        this.userId = null;
      }
    }
  }

  loadHistorial() {
    if (!this.userId) {
      this.toastr.error('Error: Usuario no identificado', 'Error');
      return;
    }

    this.loading = true;
    this.historialItems = [];

    // Obtener todos los datos en paralelo
    forkJoin({
      inputs: this.predictionInputService.getAll(),
      habitos: this.habitoService.getAll(),
      propensiones: this.propensionService.getAll()
    }).subscribe({
      next: (data) => {
        // Filtrar por usuario
        const userInputs = data.inputs.filter(input => input.idUser === this.userId);
        const userHabitos = data.habitos.filter(habito => habito.idUser === this.userId);
        const userPropensiones = data.propensiones.filter(propension => propension.idUser === this.userId);

        // Combinar los datos
        this.historialItems = userInputs.map(input => {
          const habitoOutput = userHabitos.find(h => 
            h.predictionInput?.idPredictionInput === input.idPredictionInput
          );
          const propensionOutput = userPropensiones.find(p => 
            p.predictionInput?.idPredictionInput === input.idPredictionInput
          );

          return {
            predictionInput: input,
            habitoOutput: habitoOutput || null,
            propensionOutput: propensionOutput || null,
            fecha: new Date(input.createdAt || Date.now())
          };
        });

        // Ordenar por fecha descendente (más reciente primero)
        this.historialItems.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
        
        this.loading = false;
        this.toastr.success(`Se encontraron ${this.historialItems.length} predicciones`, 'Historial cargado');
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al cargar historial:', error);
        this.toastr.error('Error al cargar el historial de predicciones', 'Error');
      }
    });
  }

  // Funciones de formateo (reutilizadas del otro componente)
  getHabitoLabel(clasificacion: string): string {
    switch(clasificacion) {
      case '1': return 'Nivel 1 - Muy Bajo';
      case '2': return 'Nivel 2 - Bajo';
      case '3': return 'Nivel 3 - Medio';
      case '4': return 'Nivel 4 - Bueno';
      case '5': return 'Nivel 5 - Excelente';
      default: return `Nivel ${clasificacion}`;
    }
  }

  getPropensionLabel(clasificacion: string): string {
    return clasificacion === '1' ? 'Alta Propensión' : 'Baja Propensión';
  }

  getHabitoSeverity(clasificacion: string): string {
    switch(clasificacion) {
      case '1': return 'danger';
      case '2': return 'warning';
      case '3': return 'info';
      case '4': return 'success';
      case '5': return 'success';
      default: return 'info';
    }
  }

  getPropensionSeverity(clasificacion: string): string {
    return clasificacion === '1' ? 'success' : 'warning';
  }

  formatPorcentaje(valor: number): string {
    if (valor > 1) {
      return `${valor.toFixed(1)}%`;
    }
    return `${(valor * 100).toFixed(1)}%`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(value);
  }

  refreshHistorial() {
    this.loadHistorial();
  }

  // Filtros
  onGlobalFilter(event: any) {
    // Implementar filtro global si es necesario
  }

  clear() {
    this.searchValue = '';
    this.rangeDates = [];
  }

  getPromedioConfianza(): string {
    if (this.historialItems.length === 0) return '0.0';
    
    let totalConfianza = 0;
    let count = 0;
    
    this.historialItems.forEach(item => {
      if (item.habitoOutput?.confianza) {
        totalConfianza += item.habitoOutput.confianza > 1 ? item.habitoOutput.confianza / 100 : item.habitoOutput.confianza;
        count++;
      }
      if (item.propensionOutput?.confianza) {
        totalConfianza += item.propensionOutput.confianza > 1 ? item.propensionOutput.confianza / 100 : item.propensionOutput.confianza;
        count++;
      }
    });
    
    return count > 0 ? ((totalConfianza / count) * 100).toFixed(1) : '0.0';
  }
}
