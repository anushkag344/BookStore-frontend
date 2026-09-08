import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { WishlistService } from '../../services/wishlist.service';
import { CartService } from '../../services/cart.service';
import { Book } from '../../services/book.service';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist {
  constructor(
    public wishlistService: WishlistService,
    public cartService: CartService,
    private router: Router
  ) {}

  get items(): Book[] {
    return this.wishlistService.wishlistItems();
  }

  getAuthorName(b: Book): string {
    return b.author || b.authorName || 'Unknown Author';
  }

  removeFromWishlist(book: Book, event: MouseEvent): void {
    event.stopPropagation();
    this.wishlistService.removeFromWishlist(book.id);
  }

  moveToBag(book: Book, event: MouseEvent): void {
    event.stopPropagation();
    this.cartService.addToCart(book);
    this.wishlistService.removeFromWishlist(book.id);
  }

  openBookDetails(id: number): void {
    this.router.navigate(['/book-details', id]);
  }
}
