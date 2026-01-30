import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ILogin, IRegister, IUser } from '../models/user.model';
import { Observable } from 'rxjs';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  http = inject(HttpClient);

  login(login: ILogin): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/auth/login', login);
  }

  register(register: IRegister): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/auth/register', register);
  }

  getProfile(): Observable<IUser> {
    return this.http.get<IUser>('/api/user');
  }

  updateProfile(data: UpdateProfileDto): Observable<IUser> {
    return this.http.patch<IUser>('/api/user', data);
  }
}