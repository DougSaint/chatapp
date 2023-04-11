import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-private-message-modal',
  templateUrl: './private-message-modal.component.html',
  styleUrls: ['./private-message-modal.component.css'],
})
export class PrivateMessageModalComponent {
  recipient: string = '';
  privateMessageText: string = '';

  @Output() privateMessageSent = new EventEmitter<{ recipient: string; text: string }>();
  @Output() modalClosed = new EventEmitter<void>();

  sendPrivateMessage() {
    console.log({ recipient: this.recipient, text: this.privateMessageText })
    this.privateMessageSent.emit({ recipient: this.recipient, text: this.privateMessageText });
    this.closeModal();
  }

  closeModal() {
    this.modalClosed.emit();
  }
}
