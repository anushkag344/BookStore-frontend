import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Book, BookService } from '../../services/book.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

import { ToastService } from '../../services/toast.service';

interface Review {
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date?: string;
}

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar, Footer],
  templateUrl: './book-details.html',
  styleUrl: './book-details.css',
})
export class BookDetails implements OnInit {
  bookId: number = 0;
  book: Book | null = null;
  selectedImage: string = '';
  thumbnails: string[] = [];

  userRating: number = 0;
  hoverRating: number = 0;
  reviewText: string = '';
  reviews: Review[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public bookService: BookService,
    public cartService: CartService,
    public wishlistService: WishlistService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.bookId = Number(idParam);
    }

    this.loadBookData();
    this.loadFeedback();
  }

  loadFeedback(): void {
    if (!this.bookId) return;
    this.bookService.getFeedback(this.bookId).subscribe((res) => {
      if (res) {
        const list = Array.isArray(res) ? res : (res.data || res.result || res.feedbackList || []);
        if (Array.isArray(list) && list.length > 0) {
          const fetchedReviews: Review[] = list.map((item: any) => ({
            name: item.userName || item.name || item.user?.firstName || 'User',
            avatar: (item.userName || item.name || 'U').charAt(0).toUpperCase(),
            rating: item.rating || 5,
            comment: item.comment || item.feedback || '',
            date: item.date || 'Recent'
          }));
          this.reviews = fetchedReviews;
        }
      }
    });
  }

  loadBookData(): void {
    if (!this.bookId) return;

    // Call backend API so request is visible in Inspect Network tab
    this.bookService.fetchBookByIdBackend(this.bookId).subscribe((b) => {
      if (b) {
        this.book = b;
        this.setupImages(b);
      } else {
        const localFound = this.bookService.getBookById(this.bookId);
        if (localFound) {
          this.book = localFound;
          this.setupImages(localFound);
        } else {
          const firstBook = this.bookService.books()[0];
          this.book = firstBook || {
            id: this.bookId || 12,
            bookName: 'Think Positive',
            author: 'James Thomas',
            authorName: 'James Thomas',
            description: 'The famous book with amazing content',
            price: 1000,
            discountPrice: 600,
            quantity: 20,
            image: 'book-shopping.png',
            rating: 4.5,
            ratingCount: 10,
          };
          this.setupImages(this.book);
        }
      }
    });
  }

  setupImages(b: Book): void {
    const mainImg = b.image || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c';
    this.selectedImage = mainImg;
    // Show thumbnail gallery
    this.thumbnails = [mainImg];
  }

  selectThumbnail(img: string): void {
    this.selectedImage = img;
  }

  getAuthorName(b: Book): string {
    return b.author || b.authorName || 'Unknown Author';
  }

  getFormattedBookId(): string {
    return '01';
  }

  get cartQuantity(): number {
    return this.book ? this.cartService.getQuantity(this.book.id) : 0;
  }

  addToBag(): void {
    if (this.book) {
      this.cartService.addToCart(this.book);
    }
  }

  increaseQuantity(): void {
    if (this.book) {
      this.cartService.updateQuantity(this.book.id, this.cartQuantity + 1);
    }
  }

  decreaseQuantity(): void {
    if (this.book) {
      this.cartService.updateQuantity(this.book.id, this.cartQuantity - 1);
    }
  }

  get isWishlisted(): boolean {
    return this.book ? this.wishlistService.isWishlisted(this.book.id) : false;
  }

  toggleWishlist(): void {
    if (!this.book) return;
    this.wishlistService.toggleWishlist(this.book);
  }

  setRating(star: number): void {
    this.userRating = star;
  }

  setHoverRating(star: number): void {
    this.hoverRating = star;
  }

  resetHoverRating(): void {
    this.hoverRating = 0;
  }

  submitReview(): void {
    if (!this.reviewText.trim()) return;

    const rating = this.userRating || 5;
    const comment = this.reviewText.trim();
    const targetBookId = this.bookId || (this.book ? this.book.id : 1);

    const newReview: Review = {
      name: 'User',
      avatar: 'U',
      rating: rating,
      comment: comment,
      date: 'Just now',
    };

    this.reviews.unshift(newReview);
    this.reviewText = '';
    this.userRating = 0;
    this.toastService.showSuccess('Feedback submitted successfully!');

    this.bookService.addFeedback(targetBookId, rating, comment).subscribe();
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'book-shopping.png';
    }
  }
}
