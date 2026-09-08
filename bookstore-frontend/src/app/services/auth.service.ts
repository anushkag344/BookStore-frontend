import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  fullName: string;
  email: string;
  role?: string;
  token?: string;
}

export interface UserLoginDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  message: string;
  token: string;
  email: string;
  role: string;
}

export interface UserRegistrationDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  mobileNumber: string;
}

export interface UserResponseDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  verified: boolean;
  role: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = '/bookstore_user';
  currentUser = signal<User | null>(this.getStoredUser());

  constructor(private http: HttpClient) {}

  private getStoredUser(): User | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const data = localStorage.getItem('currentUser');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  login(credentials: UserLoginDTO): Observable<LoginResponseDTO> {
    return this.http.post<LoginResponseDTO>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => {
        if (res && res.token) {
          const emailName = res.email ? res.email.split('@')[0] : 'User';
          const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          const userSession: User = {
            fullName: displayName,
            email: res.email,
            role: res.role,
            token: res.token,
          };
          this.setSession(userSession);
        }
      })
    );
  }

  register(data: UserRegistrationDTO): Observable<UserResponseDTO> {
    return this.http.post<UserResponseDTO>(`${this.baseUrl}/registration`, data);
  }

  forgotPassword(email: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email }, { responseType: 'text' });
  }

  resetPassword(token: string, newPassword: string): Observable<string> {
    return this.http.post(`${this.baseUrl}/reset-password`, { token, newPassword }, { responseType: 'text' });
  }

  setSession(user: User): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      if (user.token) {
        localStorage.setItem('authToken', user.token);
      }
    }
    this.currentUser.set(user);
  }

  logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    this.currentUser.set(null);
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  getUserName(): string {
    const user = this.currentUser();
    if (user && user.fullName) {
      return user.fullName;
    }
    return 'Profile';
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }
}

