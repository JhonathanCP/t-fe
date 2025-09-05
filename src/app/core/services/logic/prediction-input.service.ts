import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PredictionInput } from '../../../models/logic/prediction-input.model';
import { PredictionOutputHabito } from '../../../models/logic/prediction-output-habito.model';
import { PredictionOutputPropension } from '../../../models/logic/prediction-output-propension.model';

@Injectable({
  providedIn: 'root'
})
export class PredictionInputService {
  private apiUrl = `${environment.apiLogicUrl}/prediction-input`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los prediction inputs
   */
  getAll(): Observable<PredictionInput[]> {
    return this.http.get<PredictionInput[]>(this.apiUrl);
  }

  /**
   * Obtener prediction input por ID
   */
  getById(id: number): Observable<PredictionInput> {
    return this.http.get<PredictionInput>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nuevo prediction input y obtener predicciones
   * Retorna un array con [inputDTO, habitoOutput, propensionOutput]
   */
  create(predictionInput: PredictionInput): Observable<[PredictionInput, PredictionOutputHabito, PredictionOutputPropension]> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    console.log('PredictionInputService - URL:', this.apiUrl);
    console.log('PredictionInputService - Data:', predictionInput);
    
    return this.http.post<[PredictionInput, PredictionOutputHabito, PredictionOutputPropension]>(
      this.apiUrl, 
      predictionInput,
      { headers }
    );
  }

  /**
   * Actualizar prediction input
   */
  update(predictionInput: PredictionInput): Observable<PredictionInput> {
    return this.http.put<PredictionInput>(this.apiUrl, predictionInput);
  }

  /**
   * Eliminar prediction input por ID
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
