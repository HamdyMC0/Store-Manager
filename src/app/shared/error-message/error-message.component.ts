import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-error-message',
  templateUrl: './error-message.component.html',
  standalone: false,
})
export class ErrorMessageComponent {
  @Input() message = '';
  @Output() retry = new EventEmitter<void>();

  onRetry() {
    this.retry.emit();
  }
}
