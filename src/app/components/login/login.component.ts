import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['recepcao.aaccp@comunidade.org', [Validators.required, Validators.email]],
      senha: ['SenhaOperador123', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Preencha corretamente os dados de acesso.';
      return;
    }

    const { email, senha } = this.loginForm.value;

    // Autenticação simulada (homologação). Substituir por API/Supabase Auth em produção.
    if (email === 'recepcao.aaccp@comunidade.org' && senha === 'SenhaOperador123') {
      this.errorMessage = '';
      this.router.navigate(['/agenda']);
    } else {
      this.errorMessage = 'E-mail ou senha incorretos.';
    }
  }
}
