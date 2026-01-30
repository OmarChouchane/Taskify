import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { UserService, UpdateProfileDto } from '../../shared/services/user.service';
import { IUser } from '../../shared/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(NonNullableFormBuilder);

  user = signal<IUser | null>(null);
  isEditing = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  profileForm = this.fb.group({
    firstName: this.fb.control('', [Validators.required]),
    lastName: this.fb.control('', [Validators.required]),
    email: this.fb.control('', [Validators.required, Validators.email]),
  });

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        });
      },
      error: () => {
        this.error.set('Failed to load profile');
      },
    });
  }

  startEditing() {
    this.isEditing.set(true);
    this.error.set(null);
    this.success.set(null);
  }

  cancelEditing() {
    this.isEditing.set(false);
    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    this.error.set(null);

    const data: UpdateProfileDto = this.profileForm.value;

    this.userService.updateProfile(data).subscribe({
      next: (user) => {
        this.user.set(user);
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.success.set('Profile updated successfully');
        setTimeout(() => this.success.set(null), 3000);
      },
      error: () => {
        this.error.set('Failed to update profile');
        this.isSaving.set(false);
      },
    });
  }
}