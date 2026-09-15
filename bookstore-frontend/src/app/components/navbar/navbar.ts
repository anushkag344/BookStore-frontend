import { Component, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/book.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  searchQuery: string = '';
  showDropdown: boolean = false;

  constructor(
    public authService: AuthService,
    public bookService: BookService,
    public cartService: CartService,
    public wishlistService: WishlistService,
    private toastService: ToastService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  get cartCount(): number {
    return this.cartService.totalCount();
  }

  get wishlistCount(): number {
    return this.wishlistService.totalCount();
  }

  get userDisplayName(): string {
    return this.isLoggedIn ? this.authService.getUserName() : 'Profile';
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  onSearch() {
    this.bookService.setSearchQuery(this.searchQuery);
  }

  toggleUserMenu(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.showDropdown = !this.showDropdown;
  }

  goToLogin(): void {
    this.showDropdown = false;
    this.router.navigate(['/login']);
  }

  goToProfile(): void {
    this.showDropdown = false;
  }

  goToOrders(): void {
    this.showDropdown = false;
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/orders' } });
    } else {
      this.router.navigate(['/orders']);
    }
  }

  goToWishlist(): void {
    this.showDropdown = false;
    this.router.navigate(['/wishlist']);
  }

  logout() {
    this.showDropdown = false;
    this.authService.logout();
    this.toastService.showSuccess('Logged out successfully!');
    this.router.navigate(['/home']);
  }
}




