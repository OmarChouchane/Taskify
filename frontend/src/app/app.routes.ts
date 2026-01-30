import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { guestGuard } from './shared/guards/guest.guard';
import { organizationGuard } from './shared/guards/organization.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/account/login/login.component').then(
        (m) => m.LoginComponent
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/account/register/register.component').then(
        (m) => m.RegisterComponent
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'organizations',
    loadComponent: () =>
      import('./features/organizations/list/list.component').then(
        (m) => m.OrganizationListComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'organizations/:orgId',
    canActivate: [authGuard, organizationGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/organizations/detail/detail.component').then(
            (m) => m.OrganizationDetailComponent
          ),
      },
      {
        path: 'boards/:boardId',
        loadComponent: () =>
          import('./features/boards/detail/detail.component').then(
            (m) => m.DetailComponent
          ),
      },
    ],
  },
  {
    path: 'invitation/:code',
    loadComponent: () =>
      import('./features/invitation/accept/accept.component').then(
        (m) => m.InvitationAcceptComponent
      ),
  },
  {
    path: 'boards',
    redirectTo: 'organizations',
    pathMatch: 'full',
  },
  {
    path: 'boards/:id',
    redirectTo: 'organizations',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '',
  },
];