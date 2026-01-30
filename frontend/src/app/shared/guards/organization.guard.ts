import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { OrganizationService } from '../services/organization.service';

export const organizationGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const organizationService = inject(OrganizationService);
  const router = inject(Router);

  const orgId = route.paramMap.get('orgId');

  if (!orgId) {
    return router.createUrlTree(['/organizations']);
  }

  return organizationService.getMyRole(+orgId).pipe(
    map(role => {
      if (role) {
        return true;
      }
      return router.createUrlTree(['/organizations']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/organizations']));
    })
  );
};
