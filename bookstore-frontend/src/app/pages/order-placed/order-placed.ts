import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-order-placed',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer],
  templateUrl: './order-placed.html',
  styleUrl: './order-placed.css',
})
export class OrderPlaced implements OnInit {
  orderId: string = '';
  email: string = '';
  phone: string = '';
  address: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        const saved = localStorage.getItem('bookstore_last_order_details');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.orderId = parsed.orderId || Math.floor(100000 + Math.random() * 900000).toString();
          this.email = parsed.email || this.authService.currentUser()?.email || 'user@bookstore.com';
          this.phone = parsed.phone || '+91 9876543210';
          this.address = parsed.address || 'BridgeLabz Solutions, Mumbai';
          return;
        }
      }
    } catch {
      // Fallback
    }

    const currentUser = this.authService.currentUser();
    this.orderId = Math.floor(100000 + Math.random() * 900000).toString();
    this.email = currentUser?.email || 'user@bookstore.com';
    this.phone = '+91 9876543210';
    this.address = 'BridgeLabz Solutions, Mumbai';
  }
}
