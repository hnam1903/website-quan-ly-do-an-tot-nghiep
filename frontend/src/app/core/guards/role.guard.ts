import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userRole = authService.getUserRole();
  const allowedRoles = route.data['roles'] as string[];

  if (userRole && allowedRoles.includes(userRole)) {
    return true;
  }

  // Redirect based on role
  if (userRole === 'ADMIN') {
    router.navigate(['/admin']);
  } else if (userRole === 'LANH_DAO_BO_MON') {
    router.navigate(['/bo-mon']);
  } else if (userRole === 'GIANG_VIEN') {
    router.navigate(['/giang-vien']);
  } else if (userRole === 'SINH_VIEN') {
    router.navigate(['/sinh-vien']);
  } else {
    router.navigate(['/login']);
  }
  
  return false;
};
