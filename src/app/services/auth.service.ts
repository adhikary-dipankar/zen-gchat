import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://zenzoneapi.onrender.com/api/Auth';

  constructor(private http: HttpClient) {}

  login(model: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, model).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('username', response.username);
        localStorage.setItem('bio', response.bio || '');
      })
    );
  }

  signup(model: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, model);
  }

  googleLogin(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/google-login`, { token }).pipe(
      tap((response: any) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('username', response.username);
        localStorage.setItem('bio', response.bio || '');
      })
    );
  }

  requestPasswordReset(model: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, model);
  }

  resetPassword(model: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, model);
  }

  getUsers(): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get(`${this.apiUrl}/users`, { headers });
  }

  updateProfile(model: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.put(`${this.apiUrl}/profile`, model, { headers });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  getBio(): string | null {
    return localStorage.getItem('bio');
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('bio');
  }
}