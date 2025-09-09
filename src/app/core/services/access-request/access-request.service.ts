import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface AccessRequest {
  email: string;
  fullName: string;
  timestamp: string;
  status?: 'pending' | 'approved' | 'denied';
}

@Injectable({
  providedIn: 'root'
})
export class AccessRequestService {
  private readonly API_URL = `${environment.apiAuthUrl}/access-requests`;

  constructor(private http: HttpClient) {}

  /**
   * Envía una solicitud de acceso al backend
   */
  submitRequest(requestData: AccessRequest): Observable<any> {
    // Por ahora guardar localmente hasta configurar endpoint
    return this.saveToLocalStorage(requestData);
  }

  /**
   * Obtiene todas las solicitudes de acceso (para administradores)
   */
  getAllRequests(): Observable<AccessRequest[]> {
    return this.getFromLocalStorage();
  }

  /**
   * Actualiza el estado de una solicitud (para administradores)
   */
  updateRequestStatus(email: string, status: 'approved' | 'denied'): Observable<any> {
    return this.updateLocalStorageStatus(email, status);
  }

  /**
   * Guarda la solicitud en localStorage como fallback
   */
  private saveToLocalStorage(requestData: AccessRequest): Observable<any> {
    return new Observable(observer => {
      try {
        const existingRequests = JSON.parse(localStorage.getItem('accessRequests') || '[]');
        const newRequest = { ...requestData, status: 'pending' };
        existingRequests.push(newRequest);
        localStorage.setItem('accessRequests', JSON.stringify(existingRequests));
        
        observer.next({ success: true, message: 'Solicitud guardada localmente' });
        observer.complete();
      } catch (error) {
        observer.error({ success: false, message: 'Error al guardar solicitud' });
      }
    });
  }

  /**
   * Obtiene solicitudes desde localStorage
   */
  private getFromLocalStorage(): Observable<AccessRequest[]> {
    return new Observable(observer => {
      try {
        const requests = JSON.parse(localStorage.getItem('accessRequests') || '[]');
        observer.next(requests);
        observer.complete();
      } catch (error) {
        observer.next([]);
        observer.complete();
      }
    });
  }

  /**
   * Actualiza estado en localStorage
   */
  private updateLocalStorageStatus(email: string, status: 'approved' | 'denied'): Observable<any> {
    return new Observable(observer => {
      try {
        const requests = JSON.parse(localStorage.getItem('accessRequests') || '[]');
        const requestIndex = requests.findIndex((req: AccessRequest) => req.email === email);
        
        if (requestIndex !== -1) {
          requests[requestIndex].status = status;
          localStorage.setItem('accessRequests', JSON.stringify(requests));
          observer.next({ success: true, message: 'Estado actualizado' });
        } else {
          observer.error({ success: false, message: 'Solicitud no encontrada' });
        }
        observer.complete();
      } catch (error) {
        observer.error({ success: false, message: 'Error al actualizar estado' });
      }
    });
  }

}
