import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '../../../shared/services/organization.service';
import { InvitationService } from '../../../shared/services/invitation.service';
import { BoardService } from '../../../shared/services/board.service';
import {
  IOrganization,
  IOrganizationMember,
  IInvitation,
} from '../../../shared/models/organization.model';

@Component({
  selector: 'app-organization-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
})
export class OrganizationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orgService = inject(OrganizationService);
  private invitationService = inject(InvitationService);
  private boardService = inject(BoardService);
  private destroyRef = inject(DestroyRef);

  organization: IOrganization | null = null;
  members: IOrganizationMember[] = [];
  invitations: IInvitation[] = [];
  myRole: string | null = null;
  loading = true;

  showInviteModal = false;
  inviteEmail = '';
  inviteRole: 'admin' | 'editor' | 'viewer' = 'viewer';

  showEditModal = false;
  editName = '';
  editDescription = '';

  showAddBoardModal = false;
  newBoardName = '';

  get isAdmin(): boolean {
    return this.myRole === 'admin';
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('orgId');
    if (id) {
      this.loadOrganization(+id);
    }
  }

  loadOrganization(id: number) {
    this.loading = true;

    this.orgService.getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (org) => {
          this.organization = org;
          this.loadMembers(id);
          this.loadMyRole(id); // loadMyRole will call loadInvitations if admin
          this.loading = false;
        },
        error: () => {
          this.router.navigate(['/organizations']);
        },
      });
  }

  loadMembers(orgId: number) {
    this.orgService.getMembers(orgId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (members) => {
          this.members = members;
        },
      });
  }

  loadMyRole(orgId: number) {
    this.orgService.getMyRole(orgId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (role) => {
          this.myRole = role;
          if (role === 'admin') {
            this.loadInvitations(orgId);
          }
        },
      });
  }

  loadInvitations(orgId: number) {
    this.invitationService.getByOrganization(orgId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (invitations) => {
          this.invitations = invitations.filter((i) => !i.used);
        },
      });
  }

  openInviteModal() {
    this.showInviteModal = true;
    this.inviteEmail = '';
    this.inviteRole = 'viewer';
  }

  closeInviteModal() {
    this.showInviteModal = false;
  }

  sendInvitation() {
    if (!this.inviteEmail.trim() || !this.organization) return;

    this.invitationService
      .create({
        email: this.inviteEmail,
        role: this.inviteRole,
        organizationId: this.organization.id,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (invitation) => {
          this.invitations.push(invitation);
          this.closeInviteModal();
          alert(`Invitation sent! Code: ${invitation.code}`);
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to send invitation');
        },
      });
  }

  revokeInvitation(invitation: IInvitation) {
    if (!confirm('Are you sure you want to revoke this invitation?')) return;

    this.invitationService.revoke(invitation.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.invitations = this.invitations.filter((i) => i.id !== invitation.id);
        },
      });
  }

  updateMemberRole(member: IOrganizationMember, newRole: string) {
    if (!this.organization) return;

    this.orgService
      .updateMemberRole(this.organization.id, member.id, newRole)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          member.role = updated.role;
        },
      });
  }

  removeMember(member: IOrganizationMember) {
    if (!this.organization) return;
    if (!confirm(`Remove ${member.user.email} from the organization?`)) return;

    this.orgService.removeMember(this.organization.id, member.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.members = this.members.filter((m) => m.id !== member.id);
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to remove member');
        },
      });
  }

  openEditModal() {
    if (!this.organization) return;
    this.editName = this.organization.name;
    this.editDescription = this.organization.description || '';
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  saveOrganization() {
    if (!this.organization || !this.editName.trim()) return;

    this.orgService
      .update(this.organization.id, {
        name: this.editName,
        description: this.editDescription,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.organization = updated;
          this.closeEditModal();
        },
      });
  }

  deleteOrganization() {
    if (!this.organization) return;
    if (!confirm('Are you sure you want to delete this organization? This cannot be undone.'))
      return;

    this.orgService.delete(this.organization.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.router.navigate(['/organizations']);
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to delete organization');
        },
      });
  }

  async copyInviteLink(code: string) {
    const link = `${window.location.origin}/invitation/${code}`;
    try {
      await navigator.clipboard.writeText(link);
      alert('Invitation link copied to clipboard!');
    } catch {
      alert('Failed to copy link to clipboard');
    }
  }

  openAddBoardModal() {
    this.showAddBoardModal = true;
    this.newBoardName = '';
  }

  closeAddBoardModal() {
    this.showAddBoardModal = false;
  }

  createBoard() {
    if (!this.newBoardName.trim() || !this.organization) return;

    this.boardService.createBoard({
      name: this.newBoardName,
      organizationId: this.organization.id,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (board) => {
          if (this.organization?.boards) {
            this.organization.boards.push(board);
          } else if (this.organization) {
            this.organization.boards = [board];
          }
          this.closeAddBoardModal();
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to create board');
        },
      });
  }
}
