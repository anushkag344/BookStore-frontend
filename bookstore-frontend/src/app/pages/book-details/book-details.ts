import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Book, BookService } from '../../services/book.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';

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
    public wishlistService: WishlistService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.bookId = Number(idParam);
    }

    if (this.bookService.books().length === 0) {
      this.bookService.loadBooks();
    }

    this.loadBookData();
  }

  loadBookData(): void {
    const found = this.bookService.getBookById(this.bookId);
    if (found) {
      this.book = found;
      this.setupImages(found);
    } else {
      // Fallback or retry after load
      setTimeout(() => {
        const retryFound = this.bookService.getBookById(this.bookId);
        if (retryFound) {
          this.book = retryFound;
          this.setupImages(retryFound);
        } else {
          // Default mock book if id not matched
          this.book = {
            id: this.bookId || 1,
            bookName: "Don't Make Me Think",
            author: 'Steve Krug',
            authorName: 'Steve Krug',
            description:
              'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut',
            price: 2000,
            discountPrice: 1500,
            quantity: 20,
            image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
            rating: 4.5,
            ratingCount: 20,
          };
          this.setupImages(this.book);
        }
      }, 500);
    }
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

    const newReview: Review = {
      name: 'User',
      avatar: 'U',
      rating: this.userRating || 5,
      comment: this.reviewText.trim(),
      date: 'Just now',
    };

    this.reviews.unshift(newReview);
    this.reviewText = '';
    this.userRating = 0;
  }
}
