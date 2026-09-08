import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

export interface Book {
  id: number;
  bookName: string;
  author?: string;
  authorName?: string;
  description: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  image?: string;
  rating?: number;
  ratingCount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private apiUrl = '/bookstore_user/get/book';
  private fallbackUrl = 'http://localhost:8080/bookstore_user/get/book';

  books = signal<Book[]>([]);
  searchQuery = signal<string>('');
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  filteredBooks = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const allBooks = this.books();

    if (!query) {
      return allBooks;
    }

    return allBooks.filter((book) => {
      const nameMatch = book.bookName ? book.bookName.toLowerCase().includes(query) : false;
      const authorStr = book.author || book.authorName || '';
      const authorMatch = authorStr.toLowerCase().includes(query);
      const descMatch = book.description ? book.description.toLowerCase().includes(query) : false;
      return nameMatch || authorMatch || descMatch;
    });
  });

  constructor(private http: HttpClient) {}

  loadBooks(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.http.get<Book[]>(this.apiUrl).pipe(
      catchError(() => this.http.get<Book[]>(this.fallbackUrl)),
      catchError((err) => {
        console.error('Error loading books:', err);
        this.error.set('Failed to fetch catalog books.');
        return of([]);
      })
    ).subscribe((data) => {
      this.books.set(data || []);
      this.isLoading.set(false);
    });
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  getBookById(id: number): Book | undefined {
    return this.books().find((b) => b.id === id);
  }
}
