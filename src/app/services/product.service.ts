import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Product, ProductFormData } from '../models/product.model';
import { getErrorMessage, isValidId } from '../utils/http-error';

// the product the way the backend sends it
interface ApiProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  stock?: number;
  image?: { secure_url?: string };
  category_id?: { _id: string; name: string; slug?: string } | null;
  subcategory_id?: { _id: string; name: string } | null;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = environment.apiUrl + '/products';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<Product[]> {
    return this.http.get<{ products: ApiProduct[] }>(this.apiUrl).pipe(
      map(res => res.products.map(p => this.toProduct(p))),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  // returns null when there is no product with this id
  getProduct(id: string): Observable<Product | null> {
    if (!isValidId(id)) {
      return of(null);
    }

    return this.http.get<{ product: ApiProduct }>(`${this.apiUrl}/${id}`).pipe(
      map(res => this.toProduct(res.product)),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 404) {
          return of(null);
        }
        return throwError(() => new Error(getErrorMessage(err)));
      })
    );
  }

  addProduct(data: ProductFormData): Observable<void> {
    return this.http.post(this.apiUrl, this.toFormData(data, false)).pipe(
      map(() => undefined),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  updateProduct(id: string, data: ProductFormData): Observable<void> {
    return this.http.put(`${this.apiUrl}/${id}`, this.toFormData(data, true)).pipe(
      map(() => undefined),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      map(() => undefined),
      catchError(err => throwError(() => new Error(getErrorMessage(err))))
    );
  }

  // the backend reads the product as a form (because of the image)
  private toFormData(data: ProductFormData, isUpdate: boolean): FormData {
    const body = new FormData();
    body.append('title', data.title);
    body.append('description', data.description);
    body.append('price', String(data.price));
    body.append('stock', String(data.stock));
    body.append('category_id', data.categoryId);

    // when editing, an empty value removes the subcategory
    if (data.subcategoryId || isUpdate) {
      body.append('subcategory_id', data.subcategoryId);
    }
    if (data.image) {
      body.append('image', data.image);
    }
    return body;
  }

  private toProduct(p: ApiProduct): Product {
    return {
      id: p._id,
      title: p.title,
      description: p.description,
      price: p.price,
      stock: p.stock ? p.stock : 0,
      image: p.image && p.image.secure_url ? p.image.secure_url : '',
      categoryId: p.category_id ? p.category_id._id : '',
      category: p.category_id ? p.category_id.name : 'Uncategorized',
      categorySlug: p.category_id && p.category_id.slug ? p.category_id.slug : '',
      subcategoryId: p.subcategory_id ? p.subcategory_id._id : '',
      subcategory: p.subcategory_id ? p.subcategory_id.name : '',
      createdAt: new Date(p.createdAt)
    };
  }
}
