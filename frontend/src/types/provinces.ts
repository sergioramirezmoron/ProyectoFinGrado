export interface Province {
  "@id": string;
  id: number;
  name: string;
}

export interface ProvincesResponse {
  member: Province[];
}
