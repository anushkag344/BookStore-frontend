import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { CartService, CartItem } from '../../services/cart.service';
import { Book } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { Login } from '../login/login';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar, Footer, Login],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  // Step 1: Cart items, Step 2: Customer Details, Step 3: Order Summary
  step: number = 1;
  showLoginModal: boolean = false;

  address = {
    name: '',
    phone: '',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    type: 'Home',
  };

  isEditingAddress: boolean = true;

  constructor(
    public cartService: CartService,
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.getUserName();
    if (user && user !== 'Profile') {
      this.address.name = user;
    }
  }

  get items(): CartItem[] {
    return this.cartService.cartItems();
  }

  get totalCount(): number {
    return this.cartService.totalCount();
  }

  get totalPrice(): number {
    return this.cartService.totalPrice();
  }

  getAuthorName(book: Book): string {
    return book.author || book.authorName || 'Unknown Author';
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.book.id, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.book.id, item.quantity - 1);
    } else {
      this.removeItem(item.book.id);
    }
  }

  removeItem(bookId: number): void {
    this.cartService.removeFromCart(bookId);
  }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.step = 1;
    } else {
      const user = this.authService.currentUser();
      if (user && user.fullName && (!this.address.name || this.address.name === 'Profile')) {
        this.address.name = user.fullName;
      }
    }
  }

  proceedToAddress(): void {
    if (this.items.length === 0) {
      return;
    }
    if (!this.authService.isLoggedIn()) {
      this.showLoginModal = true;
      return;
    }
    const user = this.authService.currentUser();
    if (user && user.fullName && (!this.address.name || this.address.name === 'Profile')) {
      this.address.name = user.fullName;
    }
    this.step = 2;
    this.isEditingAddress = true;
  }

  onLoginSuccessFromModal(): void {
    this.showLoginModal = false;
    const user = this.authService.currentUser();
    if (user && user.fullName) {
      this.address.name = user.fullName;
    }
    this.step = 2;
    this.isEditingAddress = true;
  }

  closeLoginModal(): void {
    this.showLoginModal = false;
  }

  proceedToSummary(): void {
    if (!this.address.name || !this.address.phone || !this.address.address || !this.address.city || !this.address.state) {
      return;
    }
    this.isEditingAddress = false;
    this.step = 3;
  }

  editAddress(): void {
    this.isEditingAddress = true;
    this.step = 2;
  }

  checkout(): void {
    this.cartService.placeOrder(this.address).subscribe({
      next: () => {
        this.router.navigate(['/order-placed']);
      },
      error: () => {
        this.router.navigate(['/order-placed']);
      }
    });
  }
}
