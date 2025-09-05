import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authentication/auth.service'; // Adjust path if necessary

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true; // User is authenticated and token is valid, allow access
  } else {
    // User is not authenticated or token has expired, redirect to login page
    router.navigate(['/login']);
    return false;
  }
};