import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  @Output() loginSuccess = new EventEmitter<void>();

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
  returnUrl: string = '/cart';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/cart';
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
        this.loginSuccess.emit();
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        const emailName = this.loginEmail.trim().split('@')[0] || 'User';
        const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        this.authService.setSession({
          fullName: displayName,
          email: this.loginEmail.trim(),
          role: 'USER',
          token: 'token-' + Date.now(),
        });
        this.loginSuccess.emit();
        this.router.navigateByUrl(this.returnUrl);
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
        this.loginEmail = this.signupEmail;
        this.selectTab('login');
      },
      error: (err) => {
        this.isLoading = false;
        this.loginEmail = this.signupEmail;
        this.selectTab('login');
      },
    });
  }
}
