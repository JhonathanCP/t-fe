import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SidebarModule } from 'primeng/sidebar';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { ChatService } from '../../../core/services/chat/chat.service';
import { ChatMessage, ChatSession } from '../../../models/chat/chat.model';
import { ToastrService } from 'ngx-toastr';
import { MarkdownPipe } from '../../../pipes/markdown.pipe';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ScrollPanelModule,
    SidebarModule,
    DividerModule,
    TooltipModule,
    ConfirmDialogModule,
    MarkdownPipe
  ],
  providers: [ConfirmationService],
  template: `
    <div class="chat-container">
      <!-- Header -->
      <div class="chat-header">
        <button 
          pButton 
          type="button" 
          icon="pi pi-bars" 
          class="p-button-text p-button-sm"
          (click)="sidebarVisible = true"
          pTooltip="Historial de conversaciones">
        </button>
        <h3 class="m-0">Chat FinSight</h3>
        <button 
          pButton 
          type="button" 
          icon="pi pi-plus" 
          class="p-button-text p-button-sm"
          (click)="createNewChat()"
          pTooltip="Nueva conversación">
        </button>
      </div>

      <!-- Messages Container -->
      <div class="messages-container" #messagesContainer>
        <div class="messages-wrapper">
          <ng-container *ngIf="currentSession && currentSession.messages.length > 0; else noMessages">
            <div 
              *ngFor="let message of currentSession.messages" 
              class="message"
              [ngClass]="'message-' + message.role">
              <div class="message-avatar">
                <i [class]="message.role === 'user' ? 'pi pi-user' : 'pi pi-android'"></i>
              </div>
              <div class="message-content">
                <div class="message-text" [innerHTML]="message.content | markdown"></div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>
          </ng-container>
          
          <ng-template #noMessages>
            <div class="no-messages">
              <i class="pi pi-comments" style="font-size: 3rem; color: var(--text-color-secondary);"></i>
              <h4>¡Hola! Soy tu asistente financiero</h4>
              <p>Puedo ayudarte con información sobre finanzas, hábitos financieros y responder tus preguntas.</p>
              <p>¿En qué puedo asistirte hoy?</p>
            </div>
          </ng-template>
        </div>

        <!-- Loading indicator -->
        <div *ngIf="isLoading" class="message message-assistant">
          <div class="message-avatar">
            <i class="pi pi-android"></i>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="chat-input">
        <div class="input-group">
          <input 
            #messageInput
            type="text" 
            pInputText 
            [(ngModel)]="newMessage"
            placeholder="Escribe tu mensaje..."
            (keydown.enter)="sendMessage()"
            [disabled]="isLoading"
            class="message-input">
          <button 
            pButton 
            type="button" 
            icon="pi pi-send" 
            (click)="sendMessage()"
            [disabled]="!newMessage.trim() || isLoading"
            class="send-button">
          </button>
        </div>
      </div>

      <!-- Sidebar for chat history -->
      <p-sidebar 
        [(visible)]="sidebarVisible" 
        position="left" 
        [style]="{width: '300px'}"
        [modal]="false">
        <ng-template pTemplate="header">
          <h4>Conversaciones</h4>
        </ng-template>
        
        <div class="chat-history">
          <button 
            pButton 
            type="button" 
            label="Nueva conversación"
            icon="pi pi-plus"
            class="p-button-outlined w-full mb-3"
            (click)="createNewChat(); sidebarVisible = false">
          </button>
          
          <p-divider></p-divider>
          
          <div *ngFor="let session of sessions" class="session-item">
            <div 
              class="session-content"
              [ngClass]="{'active': currentSession?.id === session.id}"
              (click)="selectSession(session.id); sidebarVisible = false">
              <div class="session-title">{{ session.title }}</div>
              <div class="session-date">{{ formatDate(session.updatedAt) }}</div>
            </div>
            <button 
              pButton 
              type="button" 
              icon="pi pi-trash" 
              class="p-button-text p-button-sm p-button-danger session-delete"
              (click)="confirmDeleteSession(session)"
              pTooltip="Eliminar conversación">
            </button>
          </div>
          
          <div *ngIf="sessions.length === 0" class="no-sessions">
            <p>No hay conversaciones guardadas</p>
          </div>
        </div>
      </p-sidebar>

      <!-- Confirm Dialog -->
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-height: 600px;
      background: var(--surface-ground);
      border-radius: 8px;
      border: 1px solid var(--surface-border);
      overflow: hidden;
    }

    .chat-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem;
      background: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      background: var(--surface-ground);
    }

    .messages-wrapper {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .message {
      display: flex;
      gap: 0.75rem;
      max-width: 80%;
    }

    .message-user {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .message-assistant {
      align-self: flex-start;
    }

    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      flex-shrink: 0;
    }

    .message-user .message-avatar {
      background: var(--primary-color);
      color: var(--primary-color-text);
    }

    .message-assistant .message-avatar {
      background: var(--surface-200);
      color: var(--text-color);
    }

    .message-content {
      flex: 1;
    }

    .message-text {
      background: var(--surface-card);
      padding: 0.75rem 1rem;
      border-radius: 1rem;
      border: 1px solid var(--surface-border);
      line-height: 1.4;
    }

    .message-user .message-text {
      background: var(--primary-color);
      color: var(--primary-color-text);
      border-color: var(--primary-color);
    }

    .message-time {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
      margin-top: 0.25rem;
      text-align: right;
    }

    .message-user .message-time {
      text-align: left;
    }

    .no-messages {
      text-align: center;
      padding: 2rem;
      color: var(--text-color-secondary);
    }

    .no-messages h4 {
      margin: 1rem 0 0.5rem 0;
      color: var(--text-color);
    }

    .no-messages p {
      margin: 0.5rem 0;
      line-height: 1.5;
    }

    .typing-indicator {
      display: flex;
      gap: 0.25rem;
      padding: 0.75rem 1rem;
    }

    .typing-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--text-color-secondary);
      animation: typing 1.4s infinite ease-in-out;
    }

    .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
      0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    .chat-input {
      padding: 1rem;
      background: var(--surface-card);
      border-top: 1px solid var(--surface-border);
    }

    .input-group {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .message-input {
      flex: 1;
    }

    .send-button {
      flex-shrink: 0;
    }

    .chat-history {
      height: 100%;
      overflow-y: auto;
    }

    .session-item {
      display: flex;
      align-items: center;
      margin-bottom: 0.5rem;
      border-radius: 6px;
      overflow: hidden;
    }

    .session-content {
      flex: 1;
      padding: 0.75rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .session-content:hover {
      background: var(--surface-hover);
    }

    .session-content.active {
      background: var(--primary-50);
      border-left: 3px solid var(--primary-color);
    }

    .session-title {
      font-weight: 500;
      margin-bottom: 0.25rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .session-date {
      font-size: 0.75rem;
      color: var(--text-color-secondary);
    }

    .session-delete {
      margin-right: 0.5rem;
    }

    .no-sessions {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--text-color-secondary);
    }

    /* Estilos para contenido Markdown */
    ::ng-deep .message-text {
      line-height: 1.4;
    }

    ::ng-deep .message-text .markdown-h1 {
      font-size: 1.3rem;
      font-weight: 600;
      margin: 0.6rem 0 0.3rem 0;
      color: var(--primary-color);
    }

    ::ng-deep .message-text .markdown-h2 {
      font-size: 1.1rem;
      font-weight: 600;
      margin: 0.5rem 0 0.2rem 0;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    ::ng-deep .message-text .markdown-h3 {
      font-size: 1rem;
      font-weight: 500;
      margin: 0.4rem 0 0.2rem 0;
      color: var(--text-color);
    }

    ::ng-deep .message-text .step-number {
      background: var(--primary-color);
      color: white;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      font-weight: bold;
    }

    ::ng-deep .message-text .step-emoji {
      font-size: 1.1rem;
      margin-right: 0.3rem;
    }

    ::ng-deep .message-text .markdown-table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.6rem 0;
      font-size: 0.85rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      overflow: hidden;
    }

    ::ng-deep .message-text .markdown-table td {
      padding: 0.1rem 0.1rem;
      border: 1px solid var(--surface-border);
      background: var(--surface-0);
      vertical-align: top;
      border-top: none;
      border-bottom: none;
    }

    ::ng-deep .message-text .markdown-table tr:first-child td {
      background: var(--primary-100);
      font-weight: 600;
      color: var(--primary-800);
      border-bottom: 2px solid var(--primary-300);
      padding: 0.1rem 0.1rem;
    }

    ::ng-deep .message-text .markdown-table tr:nth-child(even) td {
      background: var(--surface-50);
    }

    ::ng-deep .message-text .markdown-table tr:hover td {
      background: var(--primary-50);
    }

    /* Eliminar bordes internos horizontales excepto después de la cabecera */
    ::ng-deep .message-text .markdown-table tr:not(:first-child) td {
      border-bottom: 1px solid var(--surface-border);
    }

    ::ng-deep .message-text .markdown-table tr:last-child td {
      border-bottom: none;
    }

    ::ng-deep .message-text .markdown-list {
      margin: 0.3rem 0;
      padding-left: 1rem;
    }

    ::ng-deep .message-text .markdown-list li {
      margin: 0.1rem 0;
    }

    ::ng-deep .message-text .markdown-code {
      background: var(--surface-100);
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
    }

    ::ng-deep .message-text strong {
      font-weight: 600;
      color: var(--primary-color);
    }

    ::ng-deep .message-text em {
      font-style: italic;
      color: var(--text-color-secondary);
    }

    /* Reducir espaciado general */
    ::ng-deep .message-text br + br {
      display: none;
    }

    /* Espaciado más compacto entre párrafos */
    ::ng-deep .message-text > * {
      margin-bottom: 0.3rem;
    }

    ::ng-deep .message-text > *:last-child {
      margin-bottom: 0;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .chat-container {
        height: 100vh;
        max-height: none;
        border-radius: 0;
      }

      .message {
        max-width: 95%;
      }

      .messages-container {
        padding: 0.75rem;
      }

      .chat-input {
        padding: 0.75rem;
      }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('messageInput') messageInput!: ElementRef;

  newMessage = '';
  isLoading = false;
  sidebarVisible = false;
  currentSession: ChatSession | null = null;
  sessions: ChatSession[] = [];

  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private toastr: ToastrService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.chatService.currentSession$
      .pipe(takeUntil(this.destroy$))
      .subscribe(session => {
        this.currentSession = session;
        this.shouldScrollToBottom = true;
      });

    this.chatService.sessions$
      .pipe(takeUntil(this.destroy$))
      .subscribe(sessions => {
        this.sessions = sessions;
      });

    // Crear primera sesión si no hay ninguna
    if (this.sessions.length === 0) {
      this.createNewChat();
    }
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isLoading) return;

    const userMessage: ChatMessage = {
      id: this.generateId(),
      content: this.newMessage.trim(),
      role: 'user',
      timestamp: new Date()
    };

    // Crear nueva sesión si no hay una activa
    if (!this.currentSession) {
      this.createNewChat();
    }

    this.chatService.addMessageToCurrentSession(userMessage);
    const messageToSend = this.newMessage.trim();
    this.newMessage = '';
    this.isLoading = true;
    this.shouldScrollToBottom = true;

    this.chatService.sendMessage(messageToSend)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.chatService.addMessageToCurrentSession(response);
          this.isLoading = false;
          this.shouldScrollToBottom = true;
          setTimeout(() => this.messageInput.nativeElement.focus(), 100);
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.toastr.error('Error al enviar el mensaje');
          this.isLoading = false;
          setTimeout(() => this.messageInput.nativeElement.focus(), 100);
        }
      });
  }

  createNewChat(): void {
    this.chatService.createNewSession();
  }

  selectSession(sessionId: string): void {
    this.chatService.selectSession(sessionId);
  }

  confirmDeleteSession(session: ChatSession): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que quieres eliminar la conversación "${session.title}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.chatService.deleteSession(session.id);
        this.toastr.success('Conversación eliminada');
      }
    });
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
