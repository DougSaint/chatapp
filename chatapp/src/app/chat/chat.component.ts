import { WebSocketService } from '../web-socket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge } from 'rxjs';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, OnDestroy {
  constructor(private webSocketService: WebSocketService) {}

  messages: any[] = [];
  messageText: string = '';
  privateMessageModalVisible: boolean = false;
  privateMessages: any[] = [];


  sendMessage() {
    console.log('sendMessage called');
    const username = localStorage.getItem('username');
    if (this.messageText.trim() !== '') {
      this.webSocketService.emit('message', { text: this.messageText, username });
      this.messages.push({text: this.messageText, username})
      this.messageText = '';
    }
  }

  sendPrivateMessage(recipient: string, text: string) {
    this.webSocketService.emit("privateMessage", { recipient, text });
  }

  ngOnInit(): void {

  
    // Registra o nome de usuário no servidor
    const username = localStorage.getItem('username');
    this.webSocketService.emit('register', username);

    // Solicitar o histórico de mensagens assim que o usuário estiver registrado
    this.webSocketService.fromEvent('registered').subscribe(() => {
      this.webSocketService.emit('getMessageHistory');
    });
  
    // Combina os observáveis dos eventos 'messageHistory', 'message' e 'privateMessage'
    const messageHistory$ = this.webSocketService.fromEvent<any[]>('messageHistory');
    const message$ = this.webSocketService.fromEvent<any>('message');
    const privateMessage$ = this.webSocketService.fromEvent<any>('privateMessage');
  
    merge(messageHistory$, message$, privateMessage$).subscribe((data) => {
      if (Array.isArray(data)) {
        console.log(1);
        this.messages = data;
      } else {
        if (data.sender) {
          console.log(3);
          this.privateMessages.push(data);
        } else {
          console.log(2);
          this.messages.push(data);
        }
      }
    });
  }
  
  
  

  ngOnDestroy(): void {
    this.webSocketService.disconnect();
  }
}
