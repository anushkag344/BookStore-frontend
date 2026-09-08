import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookService } from '../../services/book.service';
import { CartService } from '../../services/cart.service';

import { WishlistService } from '../../services/wishlist.service';

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
    private router: Router
  ) {}

  get cartCount(): number {
    return this.cartService.totalCount();
  }

  get wishlistCount(): number {
    return this.wishlistService.totalCount();
  }

  goToWishlist(): void {
    this.router.navigate(['/wishlist']);
  }

  get userDisplayName(): string {
    return this.authService.getUserName();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  onSearch() {
    this.bookService.setSearchQuery(this.searchQuery);
  }

  toggleUserMenu() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
    } else {
      this.showDropdown = !this.showDropdown;
    }
  }

  logout() {
    this.showDropdown = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}


