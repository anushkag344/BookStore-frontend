import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<ToastMessage[]>([]);
  private counter = 0;

  showSuccess(message: string, durationMs: number = 3000): void {
    this.addToast('success', message, durationMs);
  }

  showError(message: string, durationMs: number = 3000): void {
    this.addToast('error', message, durationMs);
  }

  showInfo(message: string, durationMs: number = 3000): void {
    this.addToast('info', message, durationMs);
  }

  private addToast(type: 'success' | 'error' | 'info', message: string, durationMs: number): void {
    const id = ++this.counter;
    const newToast: ToastMessage = { id, type, message };
    this.toasts.set([...this.toasts(), newToast]);

    setTimeout(() => {
      this.removeToast(id);
    }, durationMs);
  }

  removeToast(id: number): void {
    this.toasts.set(this.toasts().filter((t) => t.id !== id));
  }
}
