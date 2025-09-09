export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenAIChatRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface OpenAIChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export interface HuggingFaceRequest {
  inputs: string;
  parameters?: {
    max_length?: number;
    temperature?: number;
    top_p?: number;
    do_sample?: boolean;
    return_full_text?: boolean;
  };
}

export interface HuggingFaceResponse {
  generated_text?: string;
  text?: string;
  response?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
