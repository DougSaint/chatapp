import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router'; // Importe o serviço Router
import { WebSocketService } from '../web-socket.service';
import { from } from 'rxjs';
      
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private router: Router // Injete o serviço Router
  ) {}

  login() {
    from(this.authService.login(this.username, this.password)).subscribe(
      (response: any) => {
        console.log('Login bem-sucedido', response);
        // Armazenar o token JWT no localStorage
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('username', this.username)
        const username = localStorage.getItem('username');
        this.webSocketService.emit('register', username);
        this.router.navigate(['/chat']);
      },
      (error: any) => {
        console.error('Erro no login', error);
        this.errorMessage = 'Usuário ou senha inválidos'; // Mostrar mensagem de erro na interface do usuário
      }
    );
  }
  

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
