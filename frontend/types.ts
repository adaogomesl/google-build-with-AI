export interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isError?: boolean;
  timestamp: Date;
}

export interface WaterDataMetrics {
  specificConductance_uS_cm: number;
  totalDissolvedSolids_mg_L: number;
  ph: string;
  temperature_C: string;
}

export interface WaterDataResponse {
  station: string;
  timestamp: string;
  metrics: WaterDataMetrics;
  assessment: 'HIGH RISK' | 'NORMAL';
  notes: string;
}