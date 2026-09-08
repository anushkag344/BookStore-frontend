import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  isSuccess: boolean = false;
  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['token']) {
        this.token = params['token'];
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.message = '';
    this.isSuccess = false;

    if (!this.token.trim()) {
      this.message = 'Reset token is required.';
      return;
    }

    if (!this.newPassword.trim()) {
      this.message = 'New password is required.';
      return;
    }

    if (this.confirmPassword && this.newPassword !== this.confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.authService.resetPassword(this.token.trim(), this.newPassword).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isSuccess = true;
        this.message = res || 'Password has been reset successfully! Redirecting to login...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.isSuccess = false;
        if (err.error && typeof err.error === 'string') {
          this.message = err.error;
        } else if (err.error && err.error.message) {
          this.message = err.error.message;
        } else {
          this.message = 'Failed to reset password. Token may be invalid or expired.';
        }
      },
    });
  }
}

