import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PredictionOutputHabito } from '../../../models/logic/prediction-output-habito.model';

@Injectable({
  providedIn: 'root'
})
export class PredictionOutputHabitoService {
  private apiUrl = `${environment.apiLogicUrl}/prediction-output-habito`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los prediction outputs de hábito
   */
  getAll(): Observable<PredictionOutputHabito[]> {
    return this.http.get<PredictionOutputHabito[]>(this.apiUrl);
  }

  /**
   * Obtener prediction output habito por ID
   */
  getById(id: number): Observable<PredictionOutputHabito> {
    return this.http.get<PredictionOutputHabito>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crear nuevo prediction output habito
   */
  create(predictionOutput: PredictionOutputHabito): Observable<PredictionOutputHabito> {
    return this.http.post<PredictionOutputHabito>(this.apiUrl, predictionOutput);
  }

  /**
   * Actualizar prediction output habito
   */
  update(predictionOutput: PredictionOutputHabito): Observable<PredictionOutputHabito> {
    return this.http.put<PredictionOutputHabito>(this.apiUrl, predictionOutput);
  }

  /**
   * Eliminar prediction output habito por ID
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
