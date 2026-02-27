export interface Brand {
  id: number;
  "@id"?: string;
  name: string;
}

export interface Model {
  id: number;
  name: string;
  brand: {
    "@id": string;
    name: string;
  };
}
