import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/authentication/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToastrService } from 'ngx-toastr';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FormsModule } from '@angular/forms';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { InputTextarea } from 'primeng/inputtextarea';
import { AccessRequestService } from '../../core/services/access-request/access-request.service';


@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    InputGroupModule,
    InputGroupAddonModule,
    FormsModule,
    RecaptchaV3Module,
    DialogModule,
    DividerModule
  ]
})
export class LoginComponent {
  ngOnInit() {
  document.body.classList.add('login-page');
  }
  ngOnDestroy() {
    document.body.classList.remove('login-page');
  }
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private recaptchaV3Service = inject(ReCaptchaV3Service);
  private accessRequestService = inject(AccessRequestService);

  loading = false;
  showAccessRequestDialog = false;
  submittingRequest = false;

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  accessRequestForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', Validators.required],
    reason: ['', Validators.required]
  });

  login() {
    if (this.form.invalid) {
      this.toastr.warning('Por favor, completa todos los campos.', 'Formulario inválido');
      return;
    }

    const { username, password } = this.form.value;

    if (!username || !password) {
      this.toastr.error('Faltan campos obligatorios.', 'Error');
      return;
    }

    this.loading = true;

    this.recaptchaV3Service.execute('login').subscribe({
      next: (recaptchaToken: string) => {
        const payload = { username, password, recaptchaToken: recaptchaToken };

        this.authService.login(payload).subscribe({
          next: () => {
            this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
            this.router.navigate(['/menu']);
            this.loading = false;
          },
          error: () => {
            this.toastr.error('Credenciales incorrectas.', 'Acceso denegado');
            this.loading = false;
          }
        });
      },
      error: () => {
        this.toastr.error('Error al validar reCAPTCHA.', 'Error de seguridad');
        this.loading = false;
      }
    });
  }

  submitAccessRequest() {
    if (this.accessRequestForm.invalid) {
      this.toastr.warning('Por favor, completa todos los campos correctamente.', 'Formulario inválido');
      return;
    }

    this.submittingRequest = true;

    const requestData = {
      email: this.accessRequestForm.value.email!,
      fullName: this.accessRequestForm.value.fullName!,
      timestamp: new Date().toISOString()
    };

    this.accessRequestService.submitRequest(requestData).subscribe({
      next: (response) => {
        this.submittingRequest = false;
        this.showAccessRequestDialog = false;
        this.accessRequestForm.reset();
        this.toastr.success(
          'Tu solicitud ha sido enviada. Te contactaremos pronto.',
          'Solicitud enviada'
        );
        
      },
      error: (error) => {
        console.error('Error enviando solicitud:', error);
        this.submittingRequest = false;
        this.toastr.error(
          'Hubo un error al enviar tu solicitud. Intenta de nuevo.',
          'Error'
        );
      }
    });
  }
}
