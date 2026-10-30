import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: false
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;

  saving = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
  ) { }

  get needsActivation(): boolean {
    return this.errorMessage.toLowerCase().includes('activate');
  }

  onSubmit() {
    this.saving = true;
    this.errorMessage = '';

    this.authService.login(this.email.trim(), this.password).subscribe({
      next: (user) => {
        this.toastService.show('Welcome back, ' + user.name + '!', 'success');

        // go back to the page the user wanted before the login
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/');
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.saving = false;
      }
    });
  }
}
