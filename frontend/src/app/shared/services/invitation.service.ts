import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IInvitation, ICreateInvitation } from '../models/organization.model';

@Injectable({
  providedIn: 'root',
})
export class InvitationService {
  private http = inject(HttpClient);

  create(data: ICreateInvitation): Observable<IInvitation> {
    return this.http.post<IInvitation>('/api/invitation', data);
  }

  getByCode(code: string): Observable<IInvitation> {
    return this.http.get<IInvitation>(`/api/invitation/${code}`);
  }

  accept(code: string): Observable<{ message: string; organization: any }> {
    return this.http.post<{ message: string; organization: any }>(
      `/api/invitation/${code}/accept`,
      {}
    );
  }

  revoke(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`/api/invitation/${id}`);
  }

  getByOrganization(orgId: number): Observable<IInvitation[]> {
    return this.http.get<IInvitation[]>(`/api/invitation/organization/${orgId}`);
  }
}