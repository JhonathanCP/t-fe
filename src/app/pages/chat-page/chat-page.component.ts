import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenubarComponent } from '../../components/utilities/menubar/menubar.component';
import { FooterComponent } from '../../components/utilities/footer/footer.component';
import { ChatComponent } from '../../components/main-components/chat/chat.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [
    CommonModule,
    MenubarComponent,
    FooterComponent,
    ChatComponent
  ],
  template: `
    <div class="layout-container">
      <app-menubar></app-menubar>
      <main class="main-content">
        <div class="page-container">
          <div class="page-header">
            <h2>Chat FinSight</h2>
            <p>Conversa con nuestro asistente de inteligencia artificial para obtener información sobre finanzas personales</p>
          </div>
          <div class="chat-wrapper">
            <app-chat></app-chat>
          </div>
        </div>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .layout-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      background: var(--surface-ground);
    }

    .page-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .page-header h2 {
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      color: var(--text-color-secondary);
      font-size: 1.1rem;
    }

    .chat-wrapper {
      max-width: 900px;
      margin: 0 auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .main-content {
        padding: 1rem;
      }

      .page-header h2 {
        font-size: 1.5rem;
      }

      .page-header p {
        font-size: 1rem;
      }

      .chat-wrapper {
        margin: 0;
        box-shadow: none;
        border-radius: 0;
      }
    }
  `]
})
export class ChatPageComponent {}
