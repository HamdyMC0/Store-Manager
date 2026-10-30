import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Category } from '../models/product.model';
import { getErrorMessage } from '../utils/http-error';

interface ApiCategory {
  _id: string;
  name: string;
  slug?: string;
  image?: { secure_url?: string };
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiUrl = environment.apiUrl + '/categories';

  // the navbar and the footer listen to this list, so they update when a category changes
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  categories$ = this.categoriesSubject.asObservable();

  constructor(private http: HttpClient) { }

  getCategories(): Observable<Category[]> {
    return this.http.get<{ categories: ApiCategory[] }>(this.apiUrl).pipe(
      map(res => res.categories.map(c => this.toCategory(c))),
      tap(list => this.categoriesSubject.next(list)),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  addCategory(name: string, image: File): Observable<void> {
    const body = new FormData();
    body.append('name', name);
    body.append('image', image);

    return this.http.post(this.apiUrl, body).pipe(
      map(() => undefined),
      tap(() => this.refresh()),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  updateCategory(id: string, name: string, image: File | null): Observable<void> {
    const body = new FormData();
    body.append('name', name);
    if (image) {
      body.append('image', image);
    }

    return this.http.put(`${this.apiUrl}/${id}`, body).pipe(
      map(() => undefined),
      tap(() => this.refresh()),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined),
      tap(() => this.refresh()),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  // loads the list again so everything that uses it is updated
  refresh() {
    this.getCategories().subscribe({ error: () => { } });
  }

  private toCategory(c: ApiCategory): Category {
    return {
      id: c._id,
      name: c.name,
      slug: c.slug ? c.slug : c.name.toLowerCase(),
      image: c.image && c.image.secure_url ? c.image.secure_url : ''
    };
  }
}
