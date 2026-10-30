import { Component } from '@angular/core';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: false
})
export class RegisterComponent {
  name = '';
  email = '';
  phone = '';
  gender = '';
  password = '';
  confirmPassword = '';
  showPassword = false;

  saving = false;
  errorMessage = '';

  // when this is filled, the page shows the "check your email" message
  registeredEmail = '';

  constructor(private authService: AuthService) { }

  get passwordsMatch(): boolean {
    return this.password === this.confirmPassword;
  }

  onSubmit() {
    if (!this.passwordsMatch) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const data = {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      confirmpassword: this.confirmPassword,
      phone: this.phone.trim() ? this.phone.trim() : undefined,
      gender: this.gender ? this.gender : undefined
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.registeredEmail = data.email;
        this.saving = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.saving = false;
      }
    });
  }
}
