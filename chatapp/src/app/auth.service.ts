import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  register(username: string, password: string) {
    return this.http.post(`${this.apiUrl}/register`, { username, password });
  }

  async login(username: string, password: string) {
    const response = await this.http.post<{ token: string; }>(`${this.apiUrl}/login`, { username, password }).toPromise();
    if (response?.token) {
      this.setToken(response.token);
    }
    return response
  }
  

  setToken(token: string | null) {
    if (token) {
      console.log(token)
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();

    if (!token) {
      return false;
    }

    const jwtData = token.split('.')[1];
    const decodedJwt = JSON.parse(atob(jwtData));
    const expirationDate = new Date(decodedJwt.exp * 1000);

    return expirationDate > new Date();
  }
}
