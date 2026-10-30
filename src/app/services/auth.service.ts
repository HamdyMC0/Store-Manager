import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { AuthUser, RegisterData, UserProfile } from '../models/user.model';
import { getErrorMessage } from '../utils/http-error';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;
  private storageKey = 'store_manager_user';

  // the logged in user (null when nobody is logged in)
  currentUser: AuthUser | null = null;

  constructor(private http: HttpClient) {
    this.currentUser = this.readStorage();
  }

  get isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  get isAdmin(): boolean {
    return this.currentUser !== null && this.currentUser.role === 'admin';
  }

  register(data: RegisterData): Observable<void> {
    return this.http.post(`${this.apiUrl}/auth/register`, data).pipe(
      map(() => undefined),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http.post<{ token: string; role: 'user' | 'admin'; name: string; id: string }>(
      `${this.apiUrl}/auth/login`, { email, password }
    ).pipe(
      map(res => {
        const user: AuthUser = { id: res.id, name: res.name, role: res.role, token: res.token };
        this.saveUser(user);
        return user;
      }),
      // get the profile picture for the navbar, it is not a problem if this fails
      switchMap(user => this.getProfile().pipe(
        map(() => this.currentUser as AuthUser),
        catchError(() => of(user))
      )),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  activate(token: string): Observable<string> {
    return this.http.get<{ message: string }>(`${this.apiUrl}/auth/activate_Acc/${encodeURIComponent(token)}`).pipe(
      map(res => res.message),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  logout() {
    this.currentUser = null;
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      // storage is not available, ignore it
    }
  }

  getProfile(): Observable<UserProfile> {
    return this.http.post<{ data: UserProfile }>(`${this.apiUrl}/user/profile`, {}).pipe(
      map(res => res.data),
      tap(profile => this.setImage(profile.image ? profile.image.secure_url : undefined)),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  uploadPicture(file: File): Observable<UserProfile> {
    const body = new FormData();
    body.append('image', file);

    const id = this.currentUser ? this.currentUser.id : '';
    return this.http.post<{ user: UserProfile }>(`${this.apiUrl}/user/upload/${id}`, body).pipe(
      map(res => res.user),
      tap(profile => this.setImage(profile.image ? profile.image.secure_url : undefined)),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  // the backend sends a new token when the old one is expired
  updateToken(token: string) {
    if (this.currentUser) {
      this.saveUser({ ...this.currentUser, token });
    }
  }

  private setImage(image: string | undefined) {
    if (this.currentUser) {
      this.saveUser({ ...this.currentUser, image });
    }
  }

  private saveUser(user: AuthUser) {
    this.currentUser = user;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    } catch (e) {
      // storage is not available, the user stays logged in until the page is closed
    }
  }

  private readStorage(): AuthUser | null {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) {
        return null;
      }
      const user = JSON.parse(saved);
      if (user && user.token && (user.role === 'user' || user.role === 'admin')) {
        return user;
      }
    } catch (e) {
      // broken data in the storage
    }
    return null;
  }
}
