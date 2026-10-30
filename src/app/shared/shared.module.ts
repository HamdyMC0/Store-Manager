import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TruncatePipe } from '../pipes/truncate.pipe';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './error-message/error-message.component';
import { ToastsComponent } from './toasts/toasts.component';
import { ConfirmModalComponent } from './confirm-modal/confirm-modal.component';

@NgModule({
  declarations: [
    TruncatePipe,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    ToastsComponent,
    ConfirmModalComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    TruncatePipe,
    LoadingSpinnerComponent,
    ErrorMessageComponent,
    ToastsComponent,
    ConfirmModalComponent
  ]
})
export class SharedModule { }
