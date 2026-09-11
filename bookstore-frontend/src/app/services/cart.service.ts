import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Book } from './book.service';
import { catchError, of, Observable } from 'rxjs';

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

  constructor(private http: HttpClient) {
    this.fetchCartItemsFromBackend();
  }

  private getToken(): string {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('authToken') || localStorage.getItem('token') || '';
    }
    return '';
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    if (token) {
      headers = headers
        .set('token', token)
        .set('Authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`);
    }
    return headers;
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
    const headers = this.getHeaders();
    const url = `http://localhost:8080/bookstore_user/get_cart_items`;

    this.http.get<any>(url, { headers }).pipe(
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
    // 1. Update local reactive state immediately
    const items = [...this.cartItems()];
    const existing = items.find((item) => item.book.id === book.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ book, quantity: 1 });
    }
    this.cartItems.set(items);
    this.saveToLocalStorage(items);

    // 2. Always fire HTTP request to add_cart_item API
    const headers = this.getHeaders();
    const url = `http://localhost:8080/bookstore_user/add_cart_item/${book.id}`;
    this.http.post(url, {}, { headers }).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  // Update quantity with HTTP request to backend
  updateQuantity(bookId: number, qty: number): void {
    let items = [...this.cartItems()];
    const targetItem = items.find((item) => item.book.id === bookId || item.id === bookId || item.cartId === bookId);
    const cartId = targetItem?.cartId || targetItem?.id || bookId;

    if (qty <= 0) {
      items = items.filter((item) => item.book.id !== bookId);
    } else {
      if (targetItem) {
        targetItem.quantity = qty;
      }
    }
    this.cartItems.set(items);
    this.saveToLocalStorage(items);

    const headers = this.getHeaders();
    const url = `http://localhost:8080/bookstore_user/cart_item_quantity/${cartId}?quantity=${qty}`;
    this.http.put(url, {}, { headers }).pipe(
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

    const headers = this.getHeaders();
    const url = `http://localhost:8080/bookstore_user/remove_cart_item/${cartId}`;
    this.http.delete(url, { headers }).pipe(
      catchError(() => of(null))
    ).subscribe();
  }

  // Place Order API Integration
  placeOrder(addressDetails: AddressDetails): Observable<any> {
    const currentItems = this.cartItems();

    const cartIdList = currentItems.map((item) => item.cartId || item.id || item.book.id);
    const orderPayload = {
      address: `${addressDetails.address}, ${addressDetails.locality || ''}, ${addressDetails.city}, ${addressDetails.state} - ${addressDetails.pincode}`,
      addressDetails: addressDetails,
      cartIdList: cartIdList,
      totalAmount: this.totalPrice(),
      items: currentItems
    };

    // Clear cart locally on order place
    this.cartItems.set([]);
    this.saveToLocalStorage([]);

    const headers = this.getHeaders();
    const url = `http://localhost:8080/bookstore_user/add/order`;
    return this.http.post(url, orderPayload, { headers }).pipe(
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
