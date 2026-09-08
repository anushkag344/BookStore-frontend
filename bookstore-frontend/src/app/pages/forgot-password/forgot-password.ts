import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  email: string = '';
  message: string = '';
  isSuccess: boolean = false;
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  onResetPassword(): void {
    this.message = '';
    if (!this.email.trim()) {
      this.message = 'Please enter your email address.';
      this.isSuccess = false;
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = res || 'Password reset link / token generated successfully! Please check your email.';
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        if (err.error && typeof err.error === 'string') {
          this.message = err.error;
        } else if (err.error && err.error.message) {
          this.message = err.error.message;
        } else {
          this.message = 'Failed to request password reset. Please try again.';
        }
      },
    });
  }
}

