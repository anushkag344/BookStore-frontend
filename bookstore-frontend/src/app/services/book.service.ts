import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of, Observable } from 'rxjs';

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
  private apiPrefix = 'http://localhost:8080/bookstore_user/get/book';

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

  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (typeof window !== 'undefined' && localStorage) {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers = headers.set('token', token).set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  loadBooks(): void {
    this.isLoading.set(true);
    this.error.set(null);
    const headers = this.getHeaders();

    this.http.get<Book[]>(this.apiPrefix, { headers }).pipe(
      catchError(() => {
        return of(this.getMockBooks());
      })
    ).subscribe((data) => {
      const result = (data && Array.isArray(data) && data.length > 0) ? data : this.getMockBooks();
      this.books.set(result);
      this.isLoading.set(false);
    });
  }

  fetchBookByIdBackend(id: number): Observable<Book | null> {
    let found = this.getBookById(id);
    if (!found) {
      this.loadBooks();
      found = this.getBookById(id);
    }
    return of(found || null);
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
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
