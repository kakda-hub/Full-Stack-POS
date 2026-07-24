import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-avatar',
  standalone: false,
  templateUrl: './ui-avatar.component.html',
  styleUrl: './ui-avatar.component.scss'
})
export class UiAvatarComponent {
  @Input() imageUrl: string | null | undefined;
  @Input() name: string | null | undefined;
  @Input() size: string = 'w-10 h-10'; // Default size
  @Input() textSize: string = 'text-sm'; // Default text size
  @Input() ring: boolean = true; // Whether to show a ring
  @Input() ringColor: string = 'ring-indigo-500/20'; // Default ring color

  avatarError: boolean = false;

  get initial(): string {
    return (this.name || 'U').charAt(0).toUpperCase();
  }

  onAvatarError(): void {
    this.avatarError = true;
  }
}
