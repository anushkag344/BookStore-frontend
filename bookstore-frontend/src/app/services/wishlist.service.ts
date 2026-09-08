import { Injectable, signal, computed } from '@angular/core';
import { Book } from './book.service';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly STORAGE_KEY = 'bookstore_wishlist';

  wishlistItems = signal<Book[]>(this.loadFromStorage());

  totalCount = computed(() => this.wishlistItems().length);

  private loadFromStorage(): Book[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(items: Book[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving wishlist to storage:', e);
    }
  }

  isWishlisted(bookId: number): boolean {
    return this.wishlistItems().some((item) => item.id === bookId);
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
    if (!current.some((item) => item.id === book.id)) {
      const updated = [...current, book];
      this.wishlistItems.set(updated);
      this.saveToStorage(updated);
    }
  }

  removeFromWishlist(bookId: number): void {
    const updated = this.wishlistItems().filter((item) => item.id !== bookId);
    this.wishlistItems.set(updated);
    this.saveToStorage(updated);
  }
}
