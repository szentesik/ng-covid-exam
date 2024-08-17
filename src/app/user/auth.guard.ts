import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export const authGuard: CanActivateFn = (route, state) => {
  
  // Unregistered users limited for 3 searches maximum
  const authService = inject(AuthService);
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);
  
  if(authService.isLoggedIn || authService.guestSearchAllowed) {
    return true;
  } else {
    snackBar.open('Please log in or register for further searches', 'OK', {duration: 5000});
    router.navigate(['/register']);
    return false;
  }
};
