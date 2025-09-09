import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccessRequestService, AccessRequest } from '../../core/services/access-request/access-request.service';
import { ToastrService } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-access-requests-admin',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    TagModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  template: `
    <div class="access-requests-container">
      <div class="card">
        <div class="card-header flex justify-content-between align-items-center mb-4">
          <h2 class="m-0">Solicitudes de Acceso</h2>
          <button pButton 
                  type="button" 
                  label="Actualizar" 
                  icon="pi pi-refresh"
                  class="p-button-outlined"
                  (click)="loadRequests()">
          </button>
        </div>

        <p-table [value]="requests" 
                 [paginator]="true" 
                 [rows]="10"
                 [loading]="loading"
                 styleClass="p-datatable-striped">
          <ng-template pTemplate="header">
            <tr>
              <th>Fecha</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-request>
            <tr>
              <td>{{ formatDate(request.timestamp) }}</td>
              <td>{{ request.fullName }}</td>
              <td>{{ request.email }}</td>
              <td>
                <div class="reason-cell" [title]="request.reason">
                  {{ request.reason.length > 50 ? (request.reason | slice:0:50) + '...' : request.reason }}
                </div>
              </td>
              <td>
                <p-tag [value]="getStatusLabel(request.status)" 
                       [severity]="getStatusSeverity(request.status)">
                </p-tag>
              </td>
              <td>
                <div class="actions-buttons" *ngIf="request.status === 'pending'">
                  <button pButton 
                          type="button" 
                          icon="pi pi-check" 
                          class="p-button-success p-button-sm mr-1"
                          pTooltip="Aprobar"
                          (click)="updateStatus(request.email, 'approved')">
                  </button>
                  <button pButton 
                          type="button" 
                          icon="pi pi-times" 
                          class="p-button-danger p-button-sm"
                          pTooltip="Rechazar"
                          (click)="updateStatus(request.email, 'denied')">
                  </button>
                </div>
                <span *ngIf="request.status !== 'pending'" class="text-color-secondary">
                  {{ getStatusLabel(request.status) }}
                </span>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6" class="text-center">
                <div class="empty-state">
                  <i class="pi pi-inbox" style="font-size: 3rem; color: var(--text-color-secondary);"></i>
                  <h4>No hay solicitudes de acceso</h4>
                  <p>Las nuevas solicitudes aparecerán aquí.</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-confirmDialog></p-confirmDialog>
  `,
  styles: [`
    .access-requests-container {
      padding: 1rem;
    }

    .reason-cell {
      max-width: 200px;
      word-wrap: break-word;
    }

    .actions-buttons {
      display: flex;
      gap: 0.25rem;
    }

    .empty-state {
      padding: 2rem;
      text-align: center;
      color: var(--text-color-secondary);
    }

    .empty-state h4 {
      margin: 1rem 0 0.5rem 0;
      color: var(--text-color);
    }

    .empty-state p {
      margin: 0;
    }
  `]
})
export class AccessRequestsAdminComponent implements OnInit {
  requests: AccessRequest[] = [];
  loading = false;

  constructor(
    private accessRequestService: AccessRequestService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.accessRequestService.getAllRequests().subscribe({
      next: (requests) => {
        this.requests = requests.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error cargando solicitudes:', error);
        this.toastr.error('Error al cargar las solicitudes');
        this.loading = false;
      }
    });
  }

  updateStatus(email: string, status: 'approved' | 'denied') {
    const actionText = status === 'approved' ? 'aprobar' : 'rechazar';
    
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres ${actionText} esta solicitud?`,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: status === 'approved' ? 'p-button-success' : 'p-button-danger',
      accept: () => {
        this.accessRequestService.updateRequestStatus(email, status).subscribe({
          next: () => {
            this.toastr.success(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} exitosamente`);
            this.loadRequests();
          },
          error: (error) => {
            console.error('Error actualizando estado:', error);
            this.toastr.error('Error al actualizar el estado de la solicitud');
          }
        });
      }
    });
  }

  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'approved': return 'Aprobada';
      case 'denied': return 'Rechazada';
      case 'pending':
      default: return 'Pendiente';
    }
  }

  getStatusSeverity(status?: string): string {
    switch (status) {
      case 'approved': return 'success';
      case 'denied': return 'danger';
      case 'pending':
      default: return 'warning';
    }
  }
}
