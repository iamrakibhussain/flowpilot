export type ContractStatus =
  "DRAFT" | "PENDING_SIGNATURE" | "VIEWED" | "SIGNED" | "COUNTERSIGNED" | "DECLINED" | "VOIDED";

export interface ContractCustomer {
  id: string;
  name: string;
  email: string;
  company?: string | null;
}

export interface ContractLinkedItem {
  id: string;
  name?: string;
  quoteNumber?: string;
  totalAmount?: string | number;
}

export interface ContractItem {
  id: string;
  organizationId: string;
  customerId: string;
  quoteId?: string | null;
  projectId?: string | null;
  contractNumber: string;
  title: string;
  content: string;
  status: ContractStatus;
  signToken?: string | null;
  signTokenExpiry?: string | null;
  signedAt?: string | null;
  signerName?: string | null;
  signerEmail?: string | null;
  signerIp?: string | null;
  signatureData?: string | null;
  signatureType?: "DRAWN" | "TYPED" | null;
  contentChecksum?: string | null;
  clientNotes?: string | null;
  countersignedAt?: string | null;
  countersignerId?: string | null;
  countersignerName?: string | null;
  countersignatureData?: string | null;
  issuedAt: string;
  expiresAt?: string | null;
  viewedAt?: string | null;
  declinedAt?: string | null;
  declineReason?: string | null;
  createdAt: string;
  updatedAt: string;
  customer: ContractCustomer;
  quote?: ContractLinkedItem | null;
  project?: ContractLinkedItem | null;
}

export interface ListContractsQuery {
  status?: ContractStatus;
  customerId?: string;
  quoteId?: string;
  projectId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListContractsResponse {
  items: ContractItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateContractInput {
  customerId: string;
  quoteId?: string | null;
  projectId?: string | null;
  title: string;
  content: string;
  expiresAt?: string | null;
}

export interface UpdateContractInput {
  customerId?: string;
  quoteId?: string | null;
  projectId?: string | null;
  title?: string;
  content?: string;
  status?: ContractStatus;
  expiresAt?: string | null;
}

export interface CountersignContractInput {
  countersignerName: string;
  countersignatureData: string;
}

export interface PublicContractStatement {
  id: string;
  contractNumber: string;
  title: string;
  content: string;
  status: ContractStatus;
  issuedAt: string;
  expiresAt: string | null;
  signedAt: string | null;
  signerName: string | null;
  signerEmail: string | null;
  signatureData: string | null;
  signatureType: string | null;
  contentChecksum: string | null;
  countersignedAt: string | null;
  countersignerName: string | null;
  countersignatureData: string | null;
  organization: {
    id: string;
    name: string;
    logoUrl?: string | null;
    brandColor?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    company?: string | null;
  };
}

export interface SignContractPublicInput {
  signerName: string;
  signerEmail: string;
  signatureData: string;
  signatureType: "DRAWN" | "TYPED";
  clientNotes?: string | null;
  agreedToTerms: true;
}
