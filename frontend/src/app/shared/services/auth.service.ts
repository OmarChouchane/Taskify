import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap, filter, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuthenticated = signal<boolean>(false);
  private _authChecked$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.checkAuth().subscribe();
  }

  checkAuth(): Observable<boolean> {
    return this.http.get<{ authenticated: boolean }>('/api/auth/check').pipe(
      map((res) => res.authenticated),
      catchError(() => of(false)),
      tap((authenticated) => {
        this._isAuthenticated.set(authenticated);
        this._authChecked$.next(true);
      })
    );
  }

  /**
   * Returns an observable that emits the authentication status
   * once the initial auth check has completed.
   */
  waitForAuthCheck(): Observable<boolean> {
    if (this._authChecked$.value) {
      return of(this._isAuthenticated());
    }
    return this._authChecked$.pipe(
      filter((checked) => checked),
      take(1),
      map(() => this._isAuthenticated())
    );
  }

  isAuthenticated() {
    return this._isAuthenticated;
  }

  logout(): void {
    this.http.post('/api/auth/logout', {}).subscribe({
      next: () => this._isAuthenticated.set(false),
      error: () => this._isAuthenticated.set(false),
    });
  }

  setAuthenticated(value: boolean): void {
    this._isAuthenticated.set(value);
    this._authChecked$.next(true);
  }
}