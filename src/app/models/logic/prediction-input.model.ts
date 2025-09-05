export interface PredictionInput {
  idPredictionInput?: number;
  idUser: number;
  edad: number;
  ingreso: number;
  ahorro: number;
  endeudamiento: number;
  ocio: number;
  tarjetas: number;
  presupuestaGastos: number;
  frecuenciaTarjeta: number;
  pagoMinimo: number;
  genero: string;
  educacion?: string;
  active?: boolean;
  createdAt?: string;
}
