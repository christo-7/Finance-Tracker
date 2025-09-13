import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  submitted = false;
  error = '';
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    const q = this.route.snapshot.queryParams['returnUrl'];
    if (q) this.returnUrl = q;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid) return;

    const { email, password } = this.form.value;
    const ok = this.auth.login(email, password);
    if (ok) {
      this.router.navigateByUrl(this.returnUrl);
    } else {
      this.error = 'Invalid credentials';
    }
  }
}
