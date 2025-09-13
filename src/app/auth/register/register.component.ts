import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatch });
  }

  passwordsMatch(group: AbstractControl) {
    const p = group.get('password')?.value;
    const cp = group.get('confirmPassword')?.value;
    return p === cp ? null : { mismatch: true };
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid) return;

    const { name, email, password } = this.form.value;
    const res = this.auth.register({ name, email, password });
    if (res.success) {
      this.router.navigate(['/auth/login']);
    } else {
      this.error = res.message;
    }
  }
}
