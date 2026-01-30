import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IOrganization,
  IOrganizationMember,
  ICreateOrganization,
} from '../models/organization.model';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private http = inject(HttpClient);

  create(data: ICreateOrganization): Observable<IOrganization> {
    return this.http.post<IOrganization>('/api/organization', data);
  }

  getAll(): Observable<IOrganization[]> {
    return this.http.get<IOrganization[]>('/api/organization');
  }

  getById(id: number): Observable<IOrganization> {
    return this.http.get<IOrganization>(`/api/organization/${id}`);
  }

  update(id: number, data: Partial<ICreateOrganization>): Observable<IOrganization> {
    return this.http.patch<IOrganization>(`/api/organization/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/organization/${id}`);
  }

  getMembers(orgId: number): Observable<IOrganizationMember[]> {
    return this.http.get<IOrganizationMember[]>(`/api/organization/${orgId}/members`);
  }

  addMember(orgId: number, email: string, role: string): Observable<IOrganizationMember> {
    return this.http.post<IOrganizationMember>(`/api/organization/${orgId}/members`, {
      email,
      role,
    });
  }

  updateMemberRole(orgId: number, memberId: number, role: string): Observable<IOrganizationMember> {
    return this.http.patch<IOrganizationMember>(
      `/api/organization/${orgId}/members/${memberId}`,
      { role }
    );
  }

  removeMember(orgId: number, memberId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `/api/organization/${orgId}/members/${memberId}`
    );
  }

  getMyRole(orgId: number): Observable<string | null> {
    return this.http.get<{ role: string | null }>(`/api/organization/${orgId}/my-role`).pipe(
      map(response => response.role)
    );
  }
}