import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Registration } from './pages/registration/registration';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { Home } from './pages/home/home';
import { BookDetails } from './pages/book-details/book-details';
import { Wishlist } from './pages/wishlist/wishlist';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'signup', component: Registration },
  { path: 'registration', component: Registration },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'home', component: Home },
  { path: 'wishlist', component: Wishlist },
  { path: 'book-details/:id', component: BookDetails },
  { path: 'book/:id', component: BookDetails },
  { path: '**', redirectTo: 'login' }
];
