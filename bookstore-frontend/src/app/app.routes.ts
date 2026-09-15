import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Registration } from './pages/registration/registration';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { Wishlist } from './pages/wishlist/wishlist';
import { Cart } from './pages/cart/cart';
import { OrderPlaced } from './pages/order-placed/order-placed';
import { BookDetails } from './pages/book-details/book-details';
import { MyOrders } from './pages/my-orders/my-orders';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'signup', component: Registration },
  { path: 'registration', component: Registration },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'wishlist', component: Wishlist },
  { path: 'cart', component: Cart },
  { path: 'orders', component: MyOrders },
  { path: 'my-orders', component: MyOrders },
  { path: 'order-placed', component: OrderPlaced },
  { path: 'book-details/:id', component: BookDetails },
  { path: 'book_details/:id', component: BookDetails },
  { path: 'book_details', component: BookDetails },
  { path: 'book/:id', component: BookDetails },
  { path: '**', redirectTo: 'home' }
];

