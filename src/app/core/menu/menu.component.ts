import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../user/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../../user/login/login.component';
import { catchError, filter, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuComponent {
  @ViewChild('loginBtn', {read: ElementRef}) loginBtn!: ElementRef;

  constructor(
    protected readonly authService : AuthService,
    private readonly dialog: MatDialog,
    private readonly destroyRef: DestroyRef,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router
  ) { }

  logout() {
    this.authService.logout().subscribe();
  }

  // Display login dialog and log in user if dialog not cancelled
  login() {    
    const { bottom, left, right } = this.loginBtn.nativeElement.getClientRects()[ 0 ];
    const dialogRef = this.dialog.open(LoginComponent, {      
      position: {
        top: `${ bottom + 2 }px`,
        left: `${ left - 180}px`, 
      },
      panelClass: 'login-dialog',
    });

    dialogRef.afterClosed().pipe(        
      filter(result => result),   // Stop on cancel
      switchMap(result => this.authService.login(result.email, result.password)),
      tap(() => this.router.navigate(['/covid-info'])),
      catchError(err => {
        let msg = 'Login failed';
        if(err instanceof Error) {
          msg += `: ${err.message}`;
        } 
        this.snackBar.open(msg, 'OK', {duration: 5000});
        throw err;
      }),      
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();    
  }
}
