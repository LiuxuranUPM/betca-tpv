import { Component } from '@angular/core';

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.component.html',
  styleUrls: ['./forgotten-password.component.css']
})
export class ForgottenPasswordComponent {
  hide1 = true;
  hide2 = true;
  newPassword: string;
  confirmPassword: string;
  constructor() { }

  resetPassword(): void {
    //
  }

  samePasswords(): boolean {
    return this.newPassword === this.confirmPassword;
  }

}