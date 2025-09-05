import { PredictionInput } from './prediction-input.model';

export interface PredictionOutputHabito {
  idPredictionOutputHabito?: number;
  idUser: number;
  predictionInput: PredictionInput;
  clasificacion: string;
  confianza: number;
  probabilidades?: { [key: string]: number };
  interpretacion?: string;
  timestamp?: string;
  active?: boolean;
}
