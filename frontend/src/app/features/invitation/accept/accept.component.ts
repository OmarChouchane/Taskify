import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InvitationService } from '../../../shared/services/invitation.service';
import { AuthService } from '../../../shared/services/auth.service';
import { IInvitation } from '../../../shared/models/organization.model';

@Component({
  selector: 'app-invitation-accept',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './accept.component.html',
  styleUrls: ['./accept.component.scss'],
})
export class InvitationAcceptComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invitationService = inject(InvitationService);
  private authService = inject(AuthService);

  invitation: IInvitation | null = null;
  loading = true;
  error: string | null = null;
  accepting = false;
  isLoggedIn = false;
  private autoAccept = false;

  constructor() {
    // React to auth state changes
    effect(() => {
      this.isLoggedIn = this.authService.isAuthenticated()();
    });
  }

  ngOnInit() {
    // Check if user came from login redirect (auto-accept flow)
    this.route.queryParams.subscribe(params => {
      this.autoAccept = params['autoAccept'] === 'true';
    });

    // Wait for auth check to complete before loading invitation
    this.authService.waitForAuthCheck().subscribe((authenticated) => {
      this.isLoggedIn = authenticated;
      const code = this.route.snapshot.paramMap.get('code');
      if (code) {
        this.loadInvitation(code);
      }
    });
  }

  loadInvitation(code: string) {
    this.invitationService.getByCode(code).subscribe({
      next: (invitation) => {
        this.invitation = invitation;
        this.loading = false;

        if (invitation.used) {
          this.error = 'This invitation has already been used.';
        } else if (new Date(invitation.expiresAt) < new Date()) {
          this.error = 'This invitation has expired.';
        } else if (this.isLoggedIn && this.autoAccept) {
          // Auto-accept if user just logged in and returned from redirect
          this.acceptInvitation();
        }
      },
      error: () => {
        this.error = 'Invitation not found.';
        this.loading = false;
      },
    });
  }

  acceptInvitation() {
    if (!this.invitation) return;

    this.accepting = true;
    this.invitationService.accept(this.invitation.code).subscribe({
      next: (result) => {
        this.router.navigate(['/organizations', result.organization.id]);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to accept invitation.';
        this.accepting = false;
      },
    });
  }

  goToLogin() {
    const code = this.route.snapshot.paramMap.get('code');
    this.router.navigate(['/login'], {
      queryParams: { redirect: `/invitation/${code}?autoAccept=true` },
    });
  }
}