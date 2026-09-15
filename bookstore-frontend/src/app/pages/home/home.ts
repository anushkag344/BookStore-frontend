import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Book, BookService } from '../../services/book.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Footer],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  selectedSort: string = 'relevance';

  sortOptions = [
    { label: 'Sort by relevance', value: 'relevance' },
    { label: 'Price: Low to High', value: 'priceLowToHigh' },
    { label: 'Price: High to Low', value: 'priceHighToLow' },
    { label: 'Newest Arrivals', value: 'newest' }
  ];

  constructor(
    public bookService: BookService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.bookService.loadBooks();
  }

  get displayedBooks(): Book[] {
    let list = [...this.bookService.filteredBooks()];
    if (this.selectedSort === 'priceLowToHigh') {
      list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (this.selectedSort === 'priceHighToLow') {
      list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (this.selectedSort === 'newest') {
      list.sort((a, b) => b.id - a.id);
    }
    return list;
  }

  onSortChange(event: Event) {
    this.selectedSort = (event.target as HTMLSelectElement).value;
  }

  getAuthorName(book: Book): string {
    return book.author || book.authorName || 'Unknown Author';
  }

  openBookDetails(id: number): void {
    this.router.navigate(['/book-details', id]);
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'book-shopping.png';
    }
  }
}
