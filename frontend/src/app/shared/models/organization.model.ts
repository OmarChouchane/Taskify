import { IBoard } from './board.model';

export interface IOrganization {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  members?: IOrganizationMember[];
  boards?: IBoard[];
}

export interface IOrganizationMember {
  id: number;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface ICreateOrganization {
  name: string;
  description?: string;
}

export interface IInvitation {
  id: number;
  code: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  used: boolean;
  expiresAt: string;
  organization: IOrganization;
  invitedBy: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface ICreateInvitation {
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  organizationId: number;
}