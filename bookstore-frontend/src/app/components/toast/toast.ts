import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        class="toast-card"
        [ngClass]="toast.type"
      >
        <div class="toast-icon">
          <svg *ngIf="toast.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg *ngIf="toast.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <span class="toast-text">{{ toast.message }}</span>
        <button type="button" class="toast-close" (click)="close(toast.id)">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .toast-card {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
      color: #ffffff;
      font-size: 14px;
      font-weight: 500;
      min-width: 280px;
      max-width: 400px;
      animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    .toast-card.success {
      background: linear-gradient(135deg, #2e7d32, #1b5e20);
      border-left: 5px solid #66bb6a;
    }
    .toast-card.error {
      background: linear-gradient(135deg, #c62828, #b71c1c);
      border-left: 5px solid #ef5350;
    }
    .toast-card.info {
      background: linear-gradient(135deg, #1565c0, #0d47a1);
      border-left: 5px solid #42a5f5;
    }
    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .toast-text {
      flex: 1;
      line-height: 1.4;
    }
    .toast-close {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.8);
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
      padding: 0 4px;
    }
    .toast-close:hover {
      color: #ffffff;
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(50px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
  `]
})
export class Toast {
  constructor(public toastService: ToastService) {}

  get toasts(): ToastMessage[] {
    return this.toastService.toasts();
  }

  close(id: number): void {
    this.toastService.removeToast(id);
  }
}
