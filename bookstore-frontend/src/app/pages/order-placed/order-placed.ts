import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-order-placed',
  standalone: true,
  imports: [CommonModule, RouterLink, Navbar, Footer],
  templateUrl: './order-placed.html',
  styleUrl: './order-placed.css',
})
export class OrderPlaced {
  orderId: string;

  constructor() {
    this.orderId = Math.floor(100000 + Math.random() * 900000).toString();
  }
}
