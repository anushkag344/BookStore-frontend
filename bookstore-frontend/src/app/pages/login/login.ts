import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  activeTab: 'login' | 'signup' = 'login';

  loginEmail: string = '';
  loginPassword: string = '';

  signupFullName: string = '';
  signupEmail: string = '';
  signupPassword: string = '';
  signupMobile: string = '';

  showPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const url = this.router.url;
    if (url.includes('signup') || url.includes('registration')) {
      this.activeTab = 'signup';
    }
  }

  selectTab(tab: 'login' | 'signup'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
    this.showPassword = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.loginEmail.trim()) {
      this.errorMessage = 'Email Id is required';
      return;
    }

    if (!this.loginPassword.trim()) {
      this.errorMessage = 'Password is required';
      return;
    }

    this.isLoading = true;

    this.authService.login({
      email: this.loginEmail.trim(),
      password: this.loginPassword,
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        const msg = res.message || 'Login successful!';
        this.successMessage = msg;
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1200);
      },
      error: (err) => {
        this.isLoading = false;
        let errStr = 'Login failed. Please check your credentials.';
        if (err.error && typeof err.error === 'string') {
          errStr = err.error;
        } else if (err.error && err.error.message) {
          errStr = err.error.message;
        } else if (err.message) {
          errStr = err.message;
        }
        this.errorMessage = errStr;
      },
    });
  }

  onSignup(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.signupFullName.trim()) {
      this.errorMessage = 'Full Name is required';
      return;
    }

    if (!this.signupEmail.trim()) {
      this.errorMessage = 'Email Id is required';
      return;
    }

    if (!this.signupPassword.trim()) {
      this.errorMessage = 'Password is required';
      return;
    }

    if (!this.signupMobile.trim()) {
      this.errorMessage = 'Mobile Number is required';
      return;
    }

    const nameParts = this.signupFullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];

    this.isLoading = true;

    this.authService.register({
      firstName: firstName,
      lastName: lastName,
      email: this.signupEmail.trim(),
      password: this.signupPassword,
      mobileNumber: this.signupMobile.trim(),
    }).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Please log in.';
        setTimeout(() => {
          this.loginEmail = this.signupEmail;
          this.selectTab('login');
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        let errStr = 'Registration failed. Please check your details.';
        if (err.error && typeof err.error === 'string') {
          errStr = err.error;
        } else if (err.error && err.error.message) {
          errStr = err.error.message;
        } else if (err.message) {
          errStr = err.message;
        }
        this.errorMessage = errStr;
      },
    });
  }
}
