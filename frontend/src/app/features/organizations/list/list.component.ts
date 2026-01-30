import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrganizationService } from '../../../shared/services/organization.service';
import { IOrganization } from '../../../shared/models/organization.model';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class OrganizationListComponent implements OnInit {
  private orgService = inject(OrganizationService);

  organizations: IOrganization[] = [];
  showCreateModal = false;
  newOrgName = '';
  newOrgDescription = '';
  loading = false;

  ngOnInit() {
    this.loadOrganizations();
  }

  loadOrganizations() {
    this.loading = true;
    this.orgService.getAll().subscribe({
      next: (orgs) => {
        this.organizations = orgs;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  openCreateModal() {
    this.showCreateModal = true;
    this.newOrgName = '';
    this.newOrgDescription = '';
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  createOrganization() {
    if (!this.newOrgName.trim()) return;

    this.orgService
      .create({
        name: this.newOrgName,
        description: this.newOrgDescription,
      })
      .subscribe({
        next: (org) => {
          this.organizations.push(org);
          this.closeCreateModal();
        },
      });
  }
}