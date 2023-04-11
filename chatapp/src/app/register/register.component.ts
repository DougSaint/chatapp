import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  username: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router 
  ) {}

  register() {
    this.authService.register(this.username, this.password).subscribe(
      (response: any) => {
        localStorage.setItem('authToken', response.token);
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Erro ao registrar', error);
        // Mostrar mensagem de erro na interface do usuário
      }
    );
  }
}
