import { Component } from '@angular/core';

import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toasts',
  templateUrl: './toasts.component.html',
  standalone: false
})
export class ToastsComponent {
  constructor(public toastService: ToastService) { }
}
