import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

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

  loginEmail: string = 'user@gmail.com';
  loginPassword: string = 'Password@123';

  signupFullName: string = '';
  signupEmail: string = '';
  signupPassword: string = '';
  signupMobile: string = '';

  showPassword: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  returnUrl: string = '/home';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService,
    private cartService: CartService,
    private wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
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

    const handleSuccess = () => {
      this.isLoading = false;
      this.toastService.showSuccess('Login Successful!');
      this.loginSuccess.emit();
      // Only navigate if standalone /login route, NOT inside a modal
      if (!this.loginSuccess.observed && this.router.url.includes('login')) {
        this.router.navigateByUrl(this.returnUrl);
      }
    };

    this.authService.login({
      email: this.loginEmail.trim(),
      password: this.loginPassword,
    }).subscribe({
      next: (res) => {
        // Immediately load user's real cart and wishlist from backend
        this.cartService.fetchCartItemsFromBackend();
        this.wishlistService.fetchWishlistFromBackend();
        handleSuccess();
      },
      error: (err) => {
        this.isLoading = false;
        const errMsg = err?.error?.message || (typeof err?.error === 'string' ? err.error : null) || 'Invalid email or password';
        this.errorMessage = errMsg;
        this.toastService.showError(errMsg);
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
      next: (res: any) => {
        this.isLoading = false;
        const msg = (res && typeof res === 'string') ? res : (res?.message || 'Registration Successful! Please login.');
        this.toastService.showSuccess(msg);
        this.loginEmail = this.signupEmail;
        this.selectTab('login');
      },
      error: (err) => {
        this.isLoading = false;
        const errMsg = err?.error?.message || (typeof err?.error === 'string' ? err.error : null);
        if (errMsg) {
          this.errorMessage = errMsg;
          this.toastService.showError(errMsg);
        } else {
          this.toastService.showSuccess('Registration Successful! Please login.');
          this.loginEmail = this.signupEmail;
          this.selectTab('login');
        }
      },
    });
  }

}
