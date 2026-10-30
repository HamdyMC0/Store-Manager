import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserProfile } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  standalone: false
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  loading = true;
  errorMessage = '';

  uploading = false;
  pictureError = '';

  constructor(
    public authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.errorMessage = '';

    this.authService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.message;
        this.loading = false;
      }
    });
  }

  onPictureChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.pictureError = '';

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];

    if (!file.type.startsWith('image/')) {
      this.pictureError = 'Please choose an image file (png, jpg, webp...).';
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.pictureError = 'The image is too big. The maximum size is 5 MB.';
      input.value = '';
      return;
    }

    this.uploading = true;
    this.authService.uploadPicture(file).subscribe({
      next: (data) => {
        // keep the phone, the upload answer has the phone still encrypted
        if (this.profile) {
          this.profile = { ...this.profile, image: data.image };
        }
        this.toastService.show('Your profile picture was updated.', 'success');
        this.uploading = false;
        input.value = '';
      },
      error: (err) => {
        this.pictureError = err.message;
        this.uploading = false;
        input.value = '';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.toastService.show('You have been logged out.', 'info');
    this.router.navigate(['/']);
  }
}
