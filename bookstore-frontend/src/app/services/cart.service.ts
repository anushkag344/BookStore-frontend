import { Injectable, signal, computed } from '@angular/core';
import { Book } from './book.service';

export interface CartItem {
  book: Book;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems = signal<CartItem[]>([]);

  // Total count of all items in cart for Navbar badge
  totalCount = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  });

  addToCart(book: Book): void {
    const items = [...this.cartItems()];
    const existing = items.find((item) => item.book.id === book.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ book, quantity: 1 });
    }
    this.cartItems.set(items);
  }

  updateQuantity(bookId: number, qty: number): void {
    let items = [...this.cartItems()];
    if (qty <= 0) {
      items = items.filter((item) => item.book.id !== bookId);
    } else {
      const existing = items.find((item) => item.book.id === bookId);
      if (existing) {
        existing.quantity = qty;
      }
    }
    this.cartItems.set(items);
  }

  getQuantity(bookId: number): number {
    const item = this.cartItems().find((i) => i.book.id === bookId);
    return item ? item.quantity : 0;
  }
}
