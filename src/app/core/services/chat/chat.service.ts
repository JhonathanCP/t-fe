import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ChatMessage, OpenAIChatRequest, OpenAIChatResponse, OpenAIMessage, ChatSession } from '../../../models/chat/chat.model';
import { PredictionInputService } from '../logic/prediction-input.service';
import { PredictionOutputHabitoService } from '../logic/prediction-output-habito.service';
import { PredictionOutputPropensionService } from '../logic/prediction-output-propension.service';
import { AuthService } from '../authentication/auth.service';
import { PredictionInput } from '../../../models/logic/prediction-input.model';
import { PredictionOutputHabito } from '../../../models/logic/prediction-output-habito.model';
import { PredictionOutputPropension } from '../../../models/logic/prediction-output-propension.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly MODEL_NAME = 'openai/gpt-oss-120b:cerebras';
  private readonly API_URL = 'https://router.huggingface.co/v1/chat/completions'; // Endpoint de OpenAI compatible
  
  private currentSessionSubject = new BehaviorSubject<ChatSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();
  
  private sessionsSubject = new BehaviorSubject<ChatSession[]>([]);
  public sessions$ = this.sessionsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private predictionInputService: PredictionInputService,
    private predictionHabitoService: PredictionOutputHabitoService,
    private predictionPropensionService: PredictionOutputPropensionService,
    private authService: AuthService
  ) {
    this.loadSessions();
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${environment.huggingFaceApiKey}`,
      'Content-Type': 'application/json'
    });
  }

  sendMessage(content: string): Observable<ChatMessage> {
    // Usar solamente la API real, sin respuestas simuladas
    return this.sendMessageToAPI(content);
  }

  private getUserId(): number | null {
    const accessToken = this.authService.accessToken;
    if (!accessToken) return null;
    
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return payload.idUser || payload.userId || payload.id || null;
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  }

  private getUserPredictionContext(): Observable<string> {
    const userId = this.getUserId();
    if (!userId) {
      return of('');
    }

    return forkJoin({
      inputs: this.predictionInputService.getAll(),
      habitos: this.predictionHabitoService.getAll(),
      propensiones: this.predictionPropensionService.getAll()
    }).pipe(
      map(({ inputs, habitos, propensiones }) => {
        // Filtrar inputs por usuario y obtener el más reciente por createdAt
        const userInputs = inputs.filter(input => input.idUser === userId);
        
        if (userInputs.length === 0) {
          return '';
        }

        // Obtener el input más reciente ordenando por createdAt
        const latestInput = userInputs.sort((a, b) => 
          new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        )[0];

        // Filtrar hábitos y propensiones por el ID del input más reciente
        const inputId = latestInput.idPredictionInput;
        const relatedHabitos = habitos.filter(habito => 
          habito.predictionInput && habito.predictionInput.idPredictionInput === inputId
        );
        const relatedPropensiones = propensiones.filter(propension => 
          propension.predictionInput && propension.predictionInput.idPredictionInput === inputId
        );

        let context = 'INFORMACIÓN DE CONTEXTO DEL USUARIO:\n\n';
        
        // Información del input más reciente
        context += `PERFIL FINANCIERO ACTUAL:\n`;
        context += `- Edad: ${latestInput.edad} años\n`;
        context += `- Ingresos: S/ ${latestInput.ingreso}\n`;
        context += `- Ahorro mensual: S/ ${latestInput.ahorro}\n`;
        context += `- Endeudamiento: S/ ${latestInput.endeudamiento}\n`;
        context += `- Gastos en ocio: S/ ${latestInput.ocio}\n`;
        context += `- Número de tarjetas: ${latestInput.tarjetas}\n`;
        context += `- Presupuesto gastos: S/ ${latestInput.presupuestaGastos}\n`;
        context += `- Frecuencia uso tarjeta: ${latestInput.frecuenciaTarjeta}\n`;
        context += `- Realiza pago mínimo: ${latestInput.pagoMinimo ? 'Sí' : 'No'}\n`;
        context += `- Género: ${latestInput.genero}\n`;
        if (latestInput.educacion) {
          context += `- Educación: ${latestInput.educacion}\n`;
        }
        context += '\n';

        // Información de hábitos financieros relacionados al input
        if (relatedHabitos.length > 0) {
          const latestHabito = relatedHabitos[0]; // Tomar el primero ya que está filtrado por input específico
          context += `ANÁLISIS DE HÁBITOS FINANCIEROS:\n`;
          context += `- Clasificación: ${latestHabito.clasificacion}\n`;
          context += `- Confianza del modelo: ${(latestHabito.confianza * 100).toFixed(1)}%\n`;
          if (latestHabito.interpretacion) {
            context += `- Interpretación: ${latestHabito.interpretacion}\n`;
          }
          context += '\n';
        }

        // Información de propensión al riesgo relacionada al input
        if (relatedPropensiones.length > 0) {
          const latestPropension = relatedPropensiones[0]; // Tomar el primero ya que está filtrado por input específico
          context += `ANÁLISIS DE PROPENSIÓN AL RIESGO:\n`;
          context += `- Clasificación: ${latestPropension.clasificacion}\n`;
          context += `- Confianza del modelo: ${(latestPropension.confianza * 100).toFixed(1)}%\n`;
          if (latestPropension.interpretacion) {
            context += `- Interpretación: ${latestPropension.interpretacion}\n`;
          }
          context += '\n';
        }

        context += 'INSTRUCCIONES: Usa esta información para dar consejos personalizados y específicos basados en el perfil financiero del usuario. Siempre mantén un tono amigable y profesional.\n\n';
        
        return context;
      }),
      catchError(error => {
        console.error('Error obteniendo contexto del usuario:', error);
        return of('');
      })
    );
  }

  // Método para usar API de OpenAI compatible (siguiendo el ejemplo de JS)
  private sendMessageToAPI(content: string): Observable<ChatMessage> {
    if (!environment.huggingFaceApiKey || environment.huggingFaceApiKey === 'your-huggingface-api-key-here') {
      return of({
        id: this.generateId(),
        content: 'Por favor, configura tu API key de Hugging Face en el archivo environment.ts',
        role: 'assistant',
        timestamp: new Date()
      });
    }

    // Obtener contexto del usuario primero, luego enviar mensaje
    return this.getUserPredictionContext().pipe(
      switchMap(userContext => {
        // Preparar mensajes con contexto del usuario
        const messages: OpenAIMessage[] = [];
        
        // Agregar contexto del usuario como mensaje del sistema si existe
        if (userContext) {
          messages.push({
            role: 'system',
            content: `Eres un asistente de finanzas personales especializado. ${userContext}Basándote en esta información, proporciona consejos específicos y personalizados.`
          });
        } else {
          messages.push({
            role: 'system',
            content: 'Eres un asistente de finanzas personales especializado en ayudar con consejos sobre ahorro, inversión, presupuestos y educación financiera. Responde de manera clara y práctica.'
          });
        }

        messages.push({
          role: 'user',
          content: content
        });

        const request: OpenAIChatRequest = {
          model: this.MODEL_NAME,
          messages: messages
        };

        return this.http.post<OpenAIChatResponse>(this.API_URL, request, { headers: this.getHeaders() })
          .pipe(
            map(response => {
              let responseText = 'Lo siento, no pude procesar tu mensaje.';
              
              console.log('Respuesta completa de la API:', response);
              
              if (response && response.choices && response.choices.length > 0) {
                const choice = response.choices[0];
                if (choice.message && choice.message.content) {
                  responseText = choice.message.content.trim();
                }
              }

              return {
                id: this.generateId(),
                content: responseText,
                role: 'assistant' as const,
                timestamp: new Date()
              };
            }),
            catchError(error => {
              console.error('Error en chat:', error);
              console.error('Status:', error.status);
              console.error('Error body:', error.error);
              
              let errorMessage = 'Lo siento, hubo un error al procesar tu mensaje.';
              
              if (error.status === 404) {
                errorMessage = 'El modelo no está disponible en este momento. Por favor, intenta más tarde.';
              } else if (error.status === 401) {
                errorMessage = 'Error de autenticación. Verifica tu API key.';
              } else if (error.status === 429) {
                errorMessage = 'Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.';
              }
              
              return of({
                id: this.generateId(),
                content: errorMessage,
                role: 'assistant' as const,
                timestamp: new Date()
              });
            })
          );
      })
    );
  }

  createNewSession(): ChatSession {
    const session: ChatSession = {
      id: this.generateId(),
      title: 'Nueva conversación',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const sessions = this.sessionsSubject.value;
    sessions.unshift(session);
    this.sessionsSubject.next(sessions);
    this.currentSessionSubject.next(session);
    this.saveSessions();

    return session;
  }

  selectSession(sessionId: string): void {
    const sessions = this.sessionsSubject.value;
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      this.currentSessionSubject.next(session);
    }
  }

  addMessageToCurrentSession(message: ChatMessage): void {
    const currentSession = this.currentSessionSubject.value;
    if (currentSession) {
      currentSession.messages.push(message);
      currentSession.updatedAt = new Date();
      
      // Actualizar título si es el primer mensaje del usuario
      if (currentSession.messages.length === 1 && message.role === 'user') {
        currentSession.title = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
      }

      this.saveSessions();
      this.currentSessionSubject.next({ ...currentSession });
    }
  }

  deleteSession(sessionId: string): void {
    const sessions = this.sessionsSubject.value.filter(s => s.id !== sessionId);
    this.sessionsSubject.next(sessions);
    
    const currentSession = this.currentSessionSubject.value;
    if (currentSession && currentSession.id === sessionId) {
      this.currentSessionSubject.next(null);
    }
    
    this.saveSessions();
  }

  private loadSessions(): void {
    const saved = localStorage.getItem('chat-sessions');
    if (saved) {
      try {
        const sessions = JSON.parse(saved).map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        this.sessionsSubject.next(sessions);
      } catch (error) {
        console.error('Error loading chat sessions:', error);
      }
    }
  }

  private saveSessions(): void {
    const sessions = this.sessionsSubject.value;
    localStorage.setItem('chat-sessions', JSON.stringify(sessions));
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}