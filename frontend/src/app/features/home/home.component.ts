import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly authService = inject(AuthService);
  isLoggedIn = this.authService.isAuthenticated();

  features = [
    {
      icon: '📋',
      title: 'Kanban Boards',
      description: 'Visualize your workflow with intuitive drag-and-drop boards',
    },
    {
      icon: '👥',
      title: 'Team Collaboration',
      description: 'Work together seamlessly with role-based permissions',
    },
    {
      icon: '🏢',
      title: 'Organizations',
      description: 'Manage multiple teams and projects under one roof',
    },
    {
      icon: '📊',
      title: 'Track Progress',
      description: 'Monitor tasks and milestones in real-time',
    },
  ];
}