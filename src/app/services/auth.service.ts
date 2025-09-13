import { Injectable } from '@angular/core';

export interface User {
  name: string;
  email: string;
  password?: string; // stored here only for demo
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private USERS_KEY = 'pft_users';
  private CURRENT_USER = 'pft_current_user';

  constructor() {}

  private getUsers(): User[] {
    const raw = localStorage.getItem(this.USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  register(user: User & { password: string }): { success: boolean; message: string } {
    const users = this.getUsers();
    if (users.find(u => u.email === user.email)) {
      return { success: false, message: 'Email already registered' };
    }
    users.push(user);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    return { success: true, message: 'Registered successfully' };
  }

  login(email: string, password: string): boolean {
    const users = this.getUsers();
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      // store safe version (no password)
      localStorage.setItem(this.CURRENT_USER, JSON.stringify({ name: found.name, email: found.email }));
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER);
  }

  getCurrentUser(): User | null {
    const raw = localStorage.getItem(this.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
}
