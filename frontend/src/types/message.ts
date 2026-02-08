export interface MessagePayload {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  vehicle: string;
  messages: { content: string; isAdmin: boolean }[];
  user?: string;
}
