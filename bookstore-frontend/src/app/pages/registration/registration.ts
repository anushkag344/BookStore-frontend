import { Component } from '@angular/core';
import { Login } from '../login/login';

@Component({
  selector: 'app-registration',
  imports: [Login],
  template: `<app-login></app-login>`,
})
export class Registration {}
