import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../services/auth.service';

export interface OrderItem {
  id: number;
  bookName: string;
  author: string;
  price: number;
  quantity: number;
  image: string;
}

export interface PlacedOrder {
  orderId: string;
  orderDate: string;
  status: string;
  items: OrderItem[];
  totalPrice: number;
  email?: string;
  phone?: string;
  address?: string;
}

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer],
  templateUrl: './my-orders.html',
  styleUrl: './my-orders.css',
})
export class MyOrders implements OnInit {
  orders: PlacedOrder[] = [];
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    const localOrders = this.loadFromLocalStorage();
    this.orders = localOrders;
    this.isLoading = localOrders.length === 0;

    // Timeout safety fallback so spinner doesn't block UI if backend is slow/unavailable
    const timer = setTimeout(() => {
      this.isLoading = false;
    }, 1200);

    // Fetch orders from backend if logged in with valid token
    if (this.authService.hasValidToken()) {
      this.http.get<any>(`/bookstore_user/admin/get/order`).pipe(
        catchError(() => of(null))
      ).subscribe((res: any) => {
        clearTimeout(timer);
        this.isLoading = false;
        if (res) {
          const list = Array.isArray(res) ? res : (res.data || res.result || res.orders || []);
          if (Array.isArray(list) && list.length > 0) {
            const backendOrders: PlacedOrder[] = list.map((o: any) => {
              const itemsList = Array.isArray(o.books || o.cartItems || o.items) ? (o.books || o.cartItems || o.items) : [];
              return {
                orderId: String(o.orderId || o.id || Math.floor(100000 + Math.random() * 900000)),
                orderDate: o.orderDate || o.date || 'Recent Order',
                status: o.status || 'Order Placed',
                items: itemsList.map((i: any) => ({
                  id: i.book?.id || i.id || 1,
                  bookName: i.book?.bookName || i.bookName || 'Book Item',
                  author: i.book?.author || i.author || 'Author',
                  price: i.price || i.book?.price || 500,
                  quantity: i.quantity || 1,
                  image: i.book?.image || i.image || 'book-shopping.png'
                })),
                totalPrice: o.totalPrice || o.totalAmount || 500,
                address: o.address || ''
              };
            });
            if (backendOrders.length > 0) {
              this.orders = this.mergeOrders(backendOrders, localOrders);
            }
          }
        }
      });
    } else {
      clearTimeout(timer);
      this.isLoading = false;
    }
  }


  private mergeOrders(backend: PlacedOrder[], local: PlacedOrder[]): PlacedOrder[] {
    const combined = [...local];
    for (const b of backend) {
      if (!combined.some((l) => l.orderId === b.orderId)) {
        combined.push(b);
      }
    }
    return combined;
  }

  private loadFromLocalStorage(): PlacedOrder[] {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        const saved = localStorage.getItem('bookstore_my_orders');
        return saved ? JSON.parse(saved) : [];
      }
    } catch {
      return [];
    }
    return [];
  }

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'book-shopping.png';
    }
  }
}
