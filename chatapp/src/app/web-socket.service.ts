import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.websocketUrl);
  }

  fromEvent<T>(eventName: string): Observable<T> {
    return fromEvent<T>(this.socket, eventName);
  }
  
  // Modifique o método onMessage para ouvir um objeto de mensagem
  onMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('message', (message: any) => {
        observer.next(message);
      });
    });
  }

  emit(eventName: string, data?: any) {
    this.socket.emit(eventName, data);
  }  

  on(eventName: string, callback: (data: any) => void) {
    this.socket.on(eventName, callback);
  }

  disconnect() {
    this.socket.disconnect();
  }

  sendPrivateMessage(recipient: string, text: string): void {
    this.socket.emit('privateMessage', { recipient, text });
  }

  onMessageHistory(): Observable<any[]> {
    return new Observable((observer) => {
      this.socket.on("messageHistory", (messages: any[]) => {
        observer.next(messages);
      });
    });
  }

  onPrivateMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('privateMessage', (message: any) => {
        observer.next(message);
      });
    });
  }
}
