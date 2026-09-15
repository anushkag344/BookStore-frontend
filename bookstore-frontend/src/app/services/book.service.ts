import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of, Observable, map } from 'rxjs';

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
  private apiPrefix = '/bookstore_user/get/book';

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

    this.http.get<any>(this.apiPrefix).pipe(
      catchError(() => {
        return of(this.getMockBooks());
      })
    ).subscribe((data) => {
      let list: Book[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data && typeof data === 'object') {
        list = data.data || data.result || data.object || data.books || [];
      }
      const result = (list && list.length > 0) ? list : this.getMockBooks();
      this.books.set(result);
      this.isLoading.set(false);
    });
  }

  fetchBookByIdBackend(id: number): Observable<Book | null> {
    const existing = this.getBookById(id);
    if (existing) {
      return of(existing);
    }
    return this.http.get<any>(this.apiPrefix).pipe(
      map((data: any) => {
        let list: Book[] = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && typeof data === 'object') {
          list = data.data || data.result || data.object || data.books || [];
        }
        if (list && list.length > 0) {
          this.books.set(list);
          const found = list.find((b) => Number(b.id) === Number(id));
          return found || list[0] || null;
        }
        return null;
      }),
      catchError(() => {
        const found = this.getBookById(id);
        return of(found || null);
      })
    );
  }

  private hasValidToken(): boolean {
    if (typeof window !== 'undefined' && localStorage) {
      const t = localStorage.getItem('authToken') || localStorage.getItem('token') || '';
      return !!(t && t.trim().length > 0 && !t.startsWith('mock-token'));
    }
    return false;
  }

  addFeedback(bookId: number, rating: number, comment: string): Observable<any> {
    const payload = { rating, comment };
    const url = `/bookstore_user/add/feedback/${bookId}`;

    return this.http.post(url, payload).pipe(
      catchError(() => of({ success: true, message: 'Feedback added' }))
    );
  }

  getFeedback(bookId: number): Observable<any> {
    const url = `/bookstore_user/get/feedback/${bookId}`;
    return this.http.get(url).pipe(
      catchError(() => of([]))
    );
  }

  searchBooksBackend(query: string): Observable<Book[]> {
    const url = `/bookstore_user/search/book?query=${encodeURIComponent(query)}`;
    return this.http.get<any>(url).pipe(
      map((res: any) => {
        let list: Book[] = [];
        if (Array.isArray(res)) list = res;
        else if (res && typeof res === 'object') list = res.data || res.result || [];
        return list;
      }),
      catchError(() => of([]))
    );
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    if (query.trim().length > 1) {
      this.searchBooksBackend(query.trim()).subscribe((results) => {
        if (results && results.length > 0) {
          this.books.set(results);
        }
      });
    }
  }

  getBookById(id: number): Book | undefined {
    return this.books().find((b) => Number(b.id) === Number(id));
  }

  private getMockBooks(): Book[] {
    return [
      {
        id: 1,
        bookName: "Think Positive",
        author: "James Thomas",
        authorName: "James Thomas",
        description: "A inspiring book on positive thinking and mindset by James Thomas.",
        price: 1000,
        discountPrice: 600,
        quantity: 10,
        image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
        rating: 4.5,
        ratingCount: 10
      },
      {
        id: 2,
        bookName: "Dont make me think",
        author: "Steve Krug",
        authorName: "Steve Krug",
        description: "A Common Sense Approach to Web Usability by Steve Krug.",
        price: 700,
        discountPrice: 450,
        quantity: 20,
        image: "https://images.unsplash.com/photo-1512820790803-83ca734da794",
        rating: 4.5,
        ratingCount: 5
      },
      {
        id: 3,
        bookName: "Gitanjali",
        author: "Rabindranath Tagore",
        authorName: "Rabindranath Tagore",
        description: "A collection of poems by the Nobel laureate Rabindranath Tagore.",
        price: 800,
        discountPrice: 450,
        quantity: 15,
        image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e",
        rating: 4.5,
        ratingCount: 20
      },
      {
        id: 4,
        bookName: "War and Peace",
        author: "Leo Tolstoy",
        authorName: "Leo Tolstoy",
        description: "A literary masterpiece chronicling the French invasion of Russia.",
        price: 1000,
        discountPrice: 800,
        quantity: 12,
        image: "https://images.unsplash.com/photo-1532012197267-da84d127e765",
        rating: 4.5,
        ratingCount: 13
      },
      {
        id: 5,
        bookName: "Discovery of India",
        author: "Jawaharlal Nehru",
        authorName: "Jawaharlal Nehru",
        description: "An incredible journey through history, culture, and philosophy of India.",
        price: 1500,
        discountPrice: 900,
        quantity: 8,
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6",
        rating: 4.5,
        ratingCount: 60
      },
      {
        id: 6,
        bookName: "React Material-UI",
        author: "Steve Krug",
        authorName: "Steve Krug",
        description: "Comprehensive guide to building modern React web user interfaces.",
        price: 2000,
        discountPrice: 1500,
        quantity: 25,
        image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353",
        rating: 4.5,
        ratingCount: 20
      }
    ];
  }
}
