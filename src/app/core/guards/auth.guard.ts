import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

const authorize = (route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuthenticated) {
    return router.createUrlTree(['/login']);
  }

  const roles = route.data?.['roles'] as string[] | undefined;
  if (roles?.length && !roles.some((role) => auth.hasRole(role))) {
    return router.createUrlTree([auth.homeUrl]);
  }

  return true;
};

export const authGuard: CanActivateFn = authorize;
export const authChildGuard: CanActivateChildFn = authorize;
