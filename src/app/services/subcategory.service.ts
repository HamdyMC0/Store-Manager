import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Subcategory } from '../models/product.model';
import { getErrorMessage } from '../utils/http-error';

interface ApiSubcategory {
  _id: string;
  name: string;
  // the backend only sends the name of the category here
  category_id?: { name?: string } | null;
}

@Injectable({
  providedIn: 'root'
})
export class SubcategoryService {

  private apiUrl = environment.apiUrl + '/subcategories';

  constructor(private http: HttpClient) { }

  getSubcategories(): Observable<Subcategory[]> {
    return this.http.get<{ subcategories: ApiSubcategory[] }>(this.apiUrl).pipe(
      map(res => res.subcategories.map(s => ({
        id: s._id,
        name: s.name,
        categoryName: s.category_id && s.category_id.name ? s.category_id.name : ''
      }))),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  addSubcategory(name: string, categoryId: string): Observable<void> {
    return this.http.post(this.apiUrl, { name, category_id: categoryId }).pipe(
      map(() => undefined),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  updateSubcategory(id: string, name: string, categoryId: string): Observable<void> {
    return this.http.put(`${this.apiUrl}/${id}`, { name, category_id: categoryId }).pipe(
      map(() => undefined),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  deleteSubcategory(id: string): Observable<void> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }
}
