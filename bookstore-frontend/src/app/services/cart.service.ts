import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Book } from './book.service';
import { catchError, of, Observable } from 'rxjs';

import { ToastService } from './toast.service';

export interface CartItem {
  id?: number;
  cartId?: number;
  book: Book;
  quantity: number;
}

export interface AddressDetails {
  name: string;
  phone: string;
  pincode: string;
  locality?: string;
  address: string;
  city: string;
  state: string;
  type: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems = signal<CartItem[]>(this.loadFromLocalStorage());

  // Total count of all items in cart for Navbar badge
  totalCount = computed(() => {
    return this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
  });

  // Total price calculation
  totalPrice = computed(() => {
    return this.cartItems().reduce((sum, item) => {
      const price = item.book.discountPrice && item.book.discountPrice > 0 ? item.book.discountPrice : item.book.price;
      return sum + (price * item.quantity);
    }, 0);
  });

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {
    this.fetchCartItemsFromBackend();
  }

  private hasValidToken(): boolean {
    if (typeof window !== 'undefined' && localStorage) {
      const t = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
      if (!t || t.trim().length === 0 || t.startsWith('mock-token')) {
        return false;
      }
      try {
        const parts = t.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.exp && Date.now() >= payload.exp * 1000) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            return false;
          }
        }
      } catch {
        // continue
      }
      return true;
    }
    return false;
  }

  private loadFromLocalStorage(): CartItem[] {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        const saved = localStorage.getItem('bookstore_cart');
        return saved ? JSON.parse(saved) : [];
      }
    } catch (e) {
      console.error('Error loading cart from storage:', e);
    }
    return [];
  }

  private saveToLocalStorage(items: CartItem[]): void {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.setItem('bookstore_cart', JSON.stringify(items));
      }
    } catch (e) {
      console.error('Error saving cart to storage:', e);
    }
  }

  // Fetch cart items from backend API
  fetchCartItemsFromBackend(): void {
    const url = `/bookstore_user/get_cart_items`;

    this.http.get<any>(url).pipe(
      catchError(() => of(null))
    ).subscribe((res: any) => {
      if (res) {
        const list = Array.isArray(res) ? res : (res.data || res.result || res.cartItems || []);
        if (Array.isArray(list) && list.length > 0) {
          const currentLocal = this.cartItems();
          const backendItems: CartItem[] = list.map((item: any) => {
            const bookObj = item.book || item.bookData || item;
            const matchingLocal = currentLocal.find((l) => l.book.id === (bookObj.id || item.bookId || item.id));
            return {
              id: item.cartId || item.id || item.bookId,
              cartId: item.cartId || item.id,
              book: matchingLocal ? matchingLocal.book : bookObj,
              quantity: item.quantity || item.qty || item.bookQuantity || 1
            };
          }).filter((i) => i.book && (i.book.bookName || i.book.title));

          if (backendItems.length > 0) {
            this.cartItems.set(backendItems);
            this.saveToLocalStorage(backendItems);
          }
        }
      }
    });
  }

  // Add to cart with HTTP request to backend
  addToCart(book: Book): void {
    const items = [...this.cartItems()];
    const existing = items.find((item) => item.book.id === book.id);
    if (existing) {
      this.updateQuantity(book.id, existing.quantity + 1);
      this.toastService.showSuccess(`Updated quantity for "${book.bookName}"`);
      return;
    }

    items.push({ book, quantity: 1 });
    this.cartItems.set(items);
    this.saveToLocalStorage(items);
    this.toastService.showSuccess('Book added to Bag successfully!');

    const url = `/bookstore_user/add_cart_item/${book.id}`;
    this.http.post(url, {}).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.fetchCartItemsFromBackend();
    });
  }

  // Update quantity with HTTP request to backend
  updateQuantity(bookId: number, qty: number): void {
    if (qty <= 0) {
      this.removeFromCart(bookId);
      return;
    }

    let items = [...this.cartItems()];
    const targetItem = items.find((item) => item.book.id === bookId || item.id === bookId || item.cartId === bookId);
    const cartId = targetItem?.cartId || targetItem?.id || bookId;

    if (targetItem) {
      targetItem.quantity = qty;
    }
    this.cartItems.set(items);
    this.saveToLocalStorage(items);

    const url = `/bookstore_user/cart_item_quantity/${cartId}?quantity=${qty}`;
    this.http.put(url, {}).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  // Remove from cart with HTTP request
  removeFromCart(bookId: number): void {
    const items = this.cartItems();
    const targetItem = items.find((item) => item.book.id === bookId || item.id === bookId || item.cartId === bookId);
    const cartId = targetItem?.cartId || targetItem?.id || bookId;

    const updated = items.filter((item) => item.book.id !== bookId && item.id !== bookId && item.cartId !== bookId);
    this.cartItems.set(updated);
    this.saveToLocalStorage(updated);

    const url = `/bookstore_user/remove_cart_item/${cartId}`;
    this.http.delete(url).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  // Place Order API Integration
  placeOrder(addressDetails: AddressDetails): Observable<any> {
    const currentItems = this.cartItems();
    const orderItems = currentItems.map((item) => ({
      product_id: String(item.book.id),
      product_name: item.book.bookName,
      product_quantity: item.quantity,
      product_price: item.book.discountPrice && item.book.discountPrice > 0 ? item.book.discountPrice : item.book.price
    }));

    const orderPayload = {
      orders: orderItems
    };

    const url = `/bookstore_user/add/order`;

    this.clearCart();

    return this.http.post(url, orderPayload).pipe(
      catchError(() => of({ success: true, message: 'Order placed' }))
    );
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveToLocalStorage([]);
  }

  getQuantity(bookId: number): number {
    const item = this.cartItems().find((i) => i.book.id === bookId);
    return item ? item.quantity : 0;
  }
}

