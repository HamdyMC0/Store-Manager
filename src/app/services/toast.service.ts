import { Injectable } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  toasts: Toast[] = [];
  private nextId = 1;

  show(message: string, type: 'success' | 'danger' | 'info' = 'success') {
    const id = this.nextId++;
    this.toasts.push({ id: id, message: message, type: type });

    // remove it after 4 seconds
    setTimeout(() => this.remove(id), 4000);
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
