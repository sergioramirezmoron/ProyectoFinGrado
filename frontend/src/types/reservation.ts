export interface Reservation {
  id: number;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice?: number;
}

export interface ApiError {
  detail?: string;
  "hydra:description"?: string;
}
