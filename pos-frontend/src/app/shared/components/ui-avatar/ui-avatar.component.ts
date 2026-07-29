import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

@Component({
  selector: 'app-ui-avatar',
  standalone: false,
  templateUrl: './ui-avatar.component.html',
  styleUrl: './ui-avatar.component.scss',
})
export class UiAvatarComponent {
  @Input() imageUrl: string | null | undefined;
  @Input() name: string | null | undefined;
  @Input() size: AvatarSize = 'md';
  @Input() textSize: string = 'text-sm';
  @Input() ring: boolean = true;
  @Input() ringColor: string = 'ring-indigo-500/20';
  @Input() status: AvatarStatus | null = null;
  @Input() clickable: boolean = false;
  @Output() avatarClick = new EventEmitter<void>();

  /** Custom default fallback image URL */
  @Input() defaultImage: string = '';

  avatarError = signal(false);
  imageLoaded = signal(false);

  get statusDotColor(): string {
    switch (this.status) {
      case 'online': return 'bg-emerald-500';
      case 'offline': return 'bg-slate-400 dark:bg-slate-500';
      case 'away': return 'bg-amber-400';
      case 'busy': return 'bg-rose-500';
      default: return '';
    }
  }

  getSizeClasses(): string {
    const sizeMap: Record<string, string> = {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-14 h-14',
      xl: 'w-20 h-20',
    };
    return sizeMap[this.size] || this.size;
  }

  onAvatarError(): void {
    this.avatarError.set(true);
  }

  onImageLoad(): void {
    this.imageLoaded.set(true);
  }
}
