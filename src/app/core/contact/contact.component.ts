import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

import { SITE } from '../../site.config';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  standalone: false
})
export class ContactComponent {
  site = SITE;

  topics = ['General question', 'Project idea', 'Report a problem', 'Something else'];

  name = '';
  email = '';
  topic = '';
  message = '';

  sent = false;

  constructor(private toastService: ToastService) { }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    // there is no backend, so the message opens in the email app of the visitor
    const subject = this.topic + ' - ' + this.name;
    const body = this.message + '\n\n' + this.name + '\n' + this.email;

    window.location.href = 'mailto:' + this.site.contact.email
      + '?subject=' + encodeURIComponent(subject)
      + '&body=' + encodeURIComponent(body);

    this.toastService.show('Your email app is opening with the message ready to send.', 'info');
    this.sent = true;
    form.resetForm({ topic: '' });
  }
}
