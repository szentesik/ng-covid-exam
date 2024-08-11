import { ChangeDetectionStrategy, Component, DestroyRef, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { NewUser } from '../models/new-user.model';
import { catchError, finalize, switchMap, tap } from 'rxjs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ErrorStateMatcher } from '@angular/material/core';


// Show the error as soon as the invalid control is dirty or also when a parent form group is invalid
class GroupErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {    
    const isSubmitted = form && form.submitted;
    const isInvalid = (control && control.invalid) || (form && form.invalid)
    return !!(control && isInvalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSnackBarModule, MatProgressSpinnerModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterComponent {

  protected readonly matcher = new GroupErrorStateMatcher();

  confirmPasswordValidator: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {    
    return control.value.password === control.value.confirmPassword
      ? null
      : { PasswordNoMatch: true };      
  };  

  newUser = new FormGroup({
    name: new FormControl<string>(''),
    email: new FormControl<string>('', [Validators.required, Validators.email]),    
    password: new FormControl<string>('', [Validators.required]),
    confirmPassword: new FormControl<string>('', [Validators.required]),
  },
    this.confirmPasswordValidator
  );

  isLoading = signal(false);  

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly destroyRef: DestroyRef,
    private readonly snackBar: MatSnackBar
  ) { }   

  submit() {    
    this.isLoading.set(true);

    const newUser: NewUser = {
      username: this.newUser.value.name!,
      email: this.newUser.value.email!,
      password: this.newUser.value.password!,
    }

    this.authService.register(newUser).pipe(      
      switchMap(() => this.authService.login(newUser.email, newUser.password)),
      tap(() => this.router.navigate(['/covid-info'])),
      catchError(err => {
        this.snackBar.open('Error occurred during registration', 'OK', {duration: 5000});
        throw err;
      }),                                                                              // Error
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();    
  }
}
