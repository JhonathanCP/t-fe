import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PredictionOutputPropension } from '../../../models/logic/prediction-output-propension.model';

@Injectable({
  providedIn: 'root'
})
export class PredictionOutputPropensionService {
  private apiUrl = `${environment.apiLogicUrl}/prediction-output-propension`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los prediction outputs de propensión
   */
  getAll(): Observable<PredictionOutputPropension[]> {
    return this.http.get<PredictionOutputPropension[]>(this.apiUrl);
  }

  /**
   * Obtener prediction output propension por ID
   */
  getById(id: number): Observable<PredictionOutputPropension> {
    return this.http.get<PredictionOutputPropension>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nuevo prediction output propension
   */
  create(predictionOutput: PredictionOutputPropension): Observable<PredictionOutputPropension> {
    return this.http.post<PredictionOutputPropension>(this.apiUrl, predictionOutput);
  }

  /**
   * Actualizar prediction output propension
   */
  update(predictionOutput: PredictionOutputPropension): Observable<PredictionOutputPropension> {
    return this.http.put<PredictionOutputPropension>(this.apiUrl, predictionOutput);
  }

  /**
   * Eliminar prediction output propension por ID
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
