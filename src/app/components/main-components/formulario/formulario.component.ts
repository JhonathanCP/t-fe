import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { ToastrService } from 'ngx-toastr';
import { FieldsetModule } from 'primeng/fieldset';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';

import { PredictionInput } from '../../../models/logic/prediction-input.model';
import { PredictionOutputHabito } from '../../../models/logic/prediction-output-habito.model';
import { PredictionOutputPropension } from '../../../models/logic/prediction-output-propension.model';
import { PredictionInputService } from '../../../core/services/logic/prediction-input.service';
import { AuthService } from '../../../core/services/authentication/auth.service';

@Component({
  selector: 'app-formulario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ButtonModule,
    ProgressSpinnerModule,
    DividerModule,
    PanelModule,
    FieldsetModule,
    BadgeModule,
    TagModule,
    ProgressBarModule
  ],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.scss'
})
export class FormularioComponent implements OnInit {
  predictionForm!: FormGroup;
  loading = false;
  predicting = false;
  showResults = false;
  
  // Resultados de las predicciones
  habitoResult: PredictionOutputHabito | null = null;
  propensionResult: PredictionOutputPropension | null = null;

  // Opciones para los selects
  generoOptions = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
    { label: 'Otro', value: 'Otro' }
  ];

  educacionOptions = [
    { label: 'Primaria completa', value: 'Primaria completa' },
    { label: 'Secundaria completa', value: 'Secundaria completa' },
    { label: 'Cursando técnica', value: 'Cursando técnica' },
    { label: 'Técnica trunca', value: 'Técnica trunca' },
    { label: 'Técnica completa', value: 'Técnica completa' },
    { label: 'Cursando universitaria', value: 'Cursando universitaria' },
    { label: 'Universitaria trunca', value: 'Universitaria trunca' },
    { label: 'Universitaria completa', value: 'Universitaria completa' }
  ];

  // Opciones de frecuencia (0-4)
  frecuenciaOptions = [
    { label: 'Nunca (0)', value: 0 },
    { label: 'Casi nunca (1)', value: 1 },
    { label: 'Algunas veces (2)', value: 2 },
    { label: 'Frecuente (3)', value: 3 },
    { label: 'Muy frecuente (4)', value: 4 }
  ];

  constructor(
    private fb: FormBuilder,
    private predictionService: PredictionInputService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.predictionForm = this.fb.group({
      edad: [null, [Validators.required, Validators.min(18), Validators.max(100)]],
      ingreso: [null, [Validators.required, Validators.min(500), Validators.max(50000)]],
      ahorro: [null, [Validators.required, Validators.min(0)]],
      endeudamiento: [null, [Validators.required, Validators.min(0)]],
      ocio: [null, [Validators.required, Validators.min(0)]],
      tarjetas: [null, [Validators.required, Validators.min(0), Validators.max(10)]],
      presupuestaGastos: [null, [Validators.required, Validators.min(0), Validators.max(4)]],
      frecuenciaTarjeta: [null, [Validators.required, Validators.min(0), Validators.max(4)]],
      pagoMinimo: [null, [Validators.required, Validators.min(0), Validators.max(4)]],
      genero: [null, [Validators.required]],
      educacion: [null, [Validators.required]]
    });
  }

  onSubmit() {
    if (this.predictionForm.valid) {
      this.predicting = true;
      this.showResults = false;

      // Obtener el ID del usuario desde el token
      const accessToken = this.authService.accessToken;
      if (!accessToken) {
        this.toastr.error('Error: Usuario no identificado', 'Error');
        this.predicting = false;
        return;
      }

      let userId: number;
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('Token payload:', payload); // Para debug
        
        // Intentar obtener el ID del usuario del token
        userId = payload.idUser || payload.id || payload.sub;
        
        if (!userId || isNaN(Number(userId))) {
          throw new Error('User ID not found in token or is not a valid number');
        }
        
        userId = Number(userId); // Asegurar que sea número
      } catch (error) {
        this.toastr.error('Error: No se pudo obtener la información del usuario', 'Error');
        this.predicting = false;
        return;
      }

      const predictionData: PredictionInput = {
        idUser: userId,
        edad: this.predictionForm.value.edad,
        ingreso: this.predictionForm.value.ingreso,
        ahorro: this.predictionForm.value.ahorro,
        endeudamiento: this.predictionForm.value.endeudamiento,
        ocio: this.predictionForm.value.ocio,
        tarjetas: this.predictionForm.value.tarjetas,
        presupuestaGastos: this.predictionForm.value.presupuestaGastos,
        frecuenciaTarjeta: this.predictionForm.value.frecuenciaTarjeta,
        pagoMinimo: this.predictionForm.value.pagoMinimo,
        genero: this.predictionForm.value.genero,
        educacion: this.predictionForm.value.educacion,
        active: true,
        createdAt: new Date().toISOString()
      };

      this.predictionService.create(predictionData).subscribe({
        next: (results) => {
          this.predicting = false;
          this.showResults = true;
          
          // results es [inputDTO, habitoOutput, propensionOutput]
          if (results && results.length >= 3) {
            this.habitoResult = results[1];
            this.propensionResult = results[2];
            
            this.toastr.success('Predicción realizada con éxito', 'Éxito');
          }
        },
        error: (error) => {
          this.predicting = false;
          console.error('Error en predicción:', error);
          this.toastr.error('Error al realizar la predicción', 'Error');
        }
      });
    } else {
      this.markFormGroupTouched();
      this.toastr.warning('Por favor completa todos los campos requeridos', 'Formulario incompleto');
    }
  }

  markFormGroupTouched() {
    Object.keys(this.predictionForm.controls).forEach(key => {
      const control = this.predictionForm.get(key);
      control?.markAsTouched();
    });
  }

  resetForm() {
    this.predictionForm.reset();
    this.showResults = false;
    this.habitoResult = null;
    this.propensionResult = null;
  }

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

  getConfianzaColor(confianza: number): string {
    // Normalizar el valor a escala 0-1 si viene como porcentaje
    const normalizedValue = confianza > 1 ? confianza / 100 : confianza;
    
    if (normalizedValue >= 0.8) return '#4CAF50'; // Verde
    if (normalizedValue >= 0.6) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  }

  formatPorcentaje(valor: number): string {
    // Si el valor es mayor a 1, asumimos que ya viene como porcentaje
    if (valor > 1) {
      return `${valor.toFixed(1)}%`;
    }
    // Si es menor o igual a 1, lo convertimos a porcentaje
    return `${(valor * 100).toFixed(1)}%`;
  }

  formatHabitoProbabilityLabel(key: string): string {
    switch(key) {
      case 'Nivel_1': return 'Muy malo';
      case 'Nivel_2': return 'Malo';
      case 'Nivel_3': return 'Regular';
      case 'Nivel_4': return 'Bueno';
      case 'Nivel_5': return 'Muy bueno';
      default: return key;
    }
  }

  formatPropensionProbabilityLabel(key: string): string {
    switch(key) {
      case 'Propension_0': return 'Baja propensión al ahorro';
      case 'Propension_1': return 'Alta propensión al ahorro';
      default: return key;
    }
  }
}
