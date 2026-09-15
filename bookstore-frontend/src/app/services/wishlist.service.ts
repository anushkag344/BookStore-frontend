import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Book } from './book.service';
import { catchError, of } from 'rxjs';

import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private apiPrefix = '/bookstore_user';
  private readonly STORAGE_KEY = 'bookstore_wishlist';

  wishlistItems = signal<Book[]>(this.loadFromStorage());

  totalCount = computed(() => this.wishlistItems().length);

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {
    this.fetchWishlistFromBackend();
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

  private loadFromStorage(): Book[] {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
      }
    } catch {
      return [];
    }
    return [];
  }

  private saveToStorage(items: Book[]): void {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      }
    } catch (e) {
      console.error('Error saving wishlist to storage:', e);
    }
  }

  fetchWishlistFromBackend(): void {
    if (!this.hasValidToken()) {
      return;
    }
    const endpoint = `${this.apiPrefix}/get_wishlist_items`;

    this.http.get<any[]>(endpoint).pipe(
      catchError(() => of(null))
    ).subscribe((res) => {
      if (res && Array.isArray(res) && res.length > 0) {
        const backendItems: Book[] = res.map((item: any) => item.book || item);
        this.wishlistItems.set(backendItems);
        this.saveToStorage(backendItems);
      }
    });
  }

  isWishlisted(bookId: number): boolean {
    return this.wishlistItems().some((item) => Number(item.id) === Number(bookId));
  }

  toggleWishlist(book: Book): boolean {
    if (this.isWishlisted(book.id)) {
      this.removeFromWishlist(book.id);
      return false;
    } else {
      this.addToWishlist(book);
      return true;
    }
  }

  addToWishlist(book: Book): void {
    const current = this.wishlistItems();
    if (!current.some((item) => Number(item.id) === Number(book.id))) {
      const updated = [...current, book];
      this.wishlistItems.set(updated);
      this.saveToStorage(updated);
      this.toastService.showSuccess('Book added to Wishlist successfully!');

      const endpoint = `${this.apiPrefix}/add_wish_list/${book.id}`;
      this.http.post(endpoint, {}).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
  }

  removeFromWishlist(bookId: number): void {
    const updated = this.wishlistItems().filter((item) => Number(item.id) !== Number(bookId));
    this.wishlistItems.set(updated);
    this.saveToStorage(updated);
    this.toastService.showSuccess('Removed item from Wishlist!');

    const endpoint = `${this.apiPrefix}/remove_wishlist_item/${bookId}`;
    this.http.delete(endpoint).pipe(
      catchError(() => of(null))
    ).subscribe();
  }
}

