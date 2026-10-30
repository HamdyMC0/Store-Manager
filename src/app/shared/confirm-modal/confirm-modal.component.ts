import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  standalone: false
})
export class ConfirmModalComponent implements OnInit, OnDestroy {
  @Input() title = 'Are you sure?';
  @Input() message = '';
  @Input() detail = '';
  @Input() confirmText = 'Delete';
  @Input() busy = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  ngOnInit() {
    // the page behind the modal should not scroll
    document.body.classList.add('overflow-hidden');
  }

  ngOnDestroy() {
    document.body.classList.remove('overflow-hidden');
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.cancel.emit();
  }
}
