import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars' | 'ring' | 'fullscreen';

@Component({
  selector: 'app-loader',
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- FULLSCREEN overlay -->
    <div *ngIf="variant === 'fullscreen'"
      class="fixed inset-0 z-[9998] flex flex-col items-center justify-center gap-5"
      [class.bg-slate-900\/80]="true"
      style="backdrop-filter: blur(6px);">
      <div class="loader-ring-lg">
        <div></div><div></div><div></div><div></div>
      </div>
      <div class="text-center space-y-1">
        <p class="text-white font-semibold text-base tracking-wide">{{ text || 'Loading...' }}</p>
        <p *ngIf="subtext" class="text-slate-400 text-sm">{{ subtext }}</p>
      </div>
    </div>

    <!-- SPINNER -->
    <span *ngIf="variant === 'spinner'" class="loader-inline" [ngClass]="sizeClass" [title]="text || 'Loading'">
      <svg class="animate-spin" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"/>
        <path class="opacity-90" fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
      </svg>
    </span>

    <!-- DOTS -->
    <span *ngIf="variant === 'dots'" class="loader-dots-wrap" [ngClass]="sizeClass">
      <span class="dot dot-1"></span>
      <span class="dot dot-2"></span>
      <span class="dot dot-3"></span>
    </span>

    <!-- BARS -->
    <span *ngIf="variant === 'bars'" class="loader-bars-wrap" [ngClass]="sizeClass">
      <span class="bar bar-1"></span>
      <span class="bar bar-2"></span>
      <span class="bar bar-3"></span>
      <span class="bar bar-4"></span>
    </span>

    <!-- PULSE -->
    <span *ngIf="variant === 'pulse'" class="loader-pulse-wrap" [ngClass]="sizeClass">
      <span class="pulse-ring"></span>
      <span class="pulse-core"></span>
    </span>

    <!-- RING -->
    <span *ngIf="variant === 'ring'" class="loader-ring-sm" [ngClass]="sizeClass">
      <div></div><div></div><div></div><div></div>
    </span>

    <!-- WITH LABEL (inline block) -->
    <div *ngIf="variant !== 'fullscreen' && text && showLabel"
      class="flex items-center gap-2.5 mt-0" [ngClass]="labelWrapClass">
      <span class="text-sm font-medium" [ngClass]="labelColorClass">{{ text }}</span>
    </div>
  `,
  styles: [`
    :host { display: inline-flex; align-items: center; gap: 0.5rem; }

    /* ---- Spinner ---- */
    .loader-inline { display: inline-flex; align-items: center; justify-content: center; color: #6366f1; }
    .loader-inline.xs svg { width: 14px; height: 14px; }
    .loader-inline.sm svg { width: 18px; height: 18px; }
    .loader-inline.md svg { width: 24px; height: 24px; }
    .loader-inline.lg svg { width: 36px; height: 36px; }
    .loader-inline.xl svg { width: 48px; height: 48px; }

    /* ---- Dots ---- */
    .loader-dots-wrap { display: inline-flex; align-items: center; gap: 4px; }
    .dot {
      border-radius: 50%;
      background: #6366f1;
      animation: dotBounce 1.2s ease-in-out infinite;
    }
    .dot-1 { animation-delay: 0s; }
    .dot-2 { animation-delay: 0.2s; }
    .dot-3 { animation-delay: 0.4s; }
    .xs .dot { width: 5px; height: 5px; }
    .sm .dot { width: 7px; height: 7px; }
    .md .dot { width: 9px; height: 9px; }
    .lg .dot { width: 12px; height: 12px; }
    .xl .dot { width: 15px; height: 15px; }
    @keyframes dotBounce {
      0%, 80%, 100% { transform: scale(0.5); opacity: 0.4; }
      40%            { transform: scale(1);   opacity: 1; }
    }

    /* ---- Bars ---- */
    .loader-bars-wrap { display: inline-flex; align-items: flex-end; gap: 3px; }
    .bar {
      background: #6366f1;
      border-radius: 3px;
      animation: barGrow 1s ease-in-out infinite;
    }
    .bar-1 { animation-delay: 0s; }
    .bar-2 { animation-delay: 0.15s; }
    .bar-3 { animation-delay: 0.30s; }
    .bar-4 { animation-delay: 0.45s; }
    .xs .bar  { width: 3px; height: 12px; }
    .sm .bar  { width: 4px; height: 16px; }
    .md .bar  { width: 5px; height: 22px; }
    .lg .bar  { width: 6px; height: 30px; }
    .xl .bar  { width: 8px; height: 40px; }
    @keyframes barGrow {
      0%, 100% { transform: scaleY(0.4); opacity: 0.5; }
      50%       { transform: scaleY(1);   opacity: 1; }
    }

    /* ---- Pulse ---- */
    .loader-pulse-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; }
    .pulse-ring {
      position: absolute;
      border-radius: 50%;
      background: rgba(99,102,241,0.25);
      animation: pulseRing 1.5s ease-out infinite;
    }
    .pulse-core {
      border-radius: 50%;
      background: #6366f1;
      position: relative;
    }
    .xs .pulse-wrap, .xs .pulse-ring { width: 20px; height: 20px; }
    .xs .pulse-core { width: 10px; height: 10px; }
    .sm .loader-pulse-wrap, .sm .pulse-ring { width: 26px; height: 26px; }
    .sm .pulse-core { width: 13px; height: 13px; }
    .md .loader-pulse-wrap, .md .pulse-ring { width: 36px; height: 36px; }
    .md .pulse-core { width: 18px; height: 18px; }
    .lg .loader-pulse-wrap, .lg .pulse-ring { width: 52px; height: 52px; }
    .lg .pulse-core { width: 26px; height: 26px; }
    @keyframes pulseRing {
      0%   { transform: scale(0.5); opacity: 0.8; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    /* ---- Ring ---- */
    .loader-ring-sm, .loader-ring-lg {
      display: inline-block;
      position: relative;
    }
    .loader-ring-sm div, .loader-ring-lg div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      border-radius: 50%;
      border-style: solid;
      border-color: #6366f1 transparent transparent transparent;
      animation: ringRotate 1s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    .loader-ring-sm.xs  { width: 20px; height: 20px; }
    .loader-ring-sm.xs div  { width: 20px; height: 20px; border-width: 2px; margin: 0; }
    .loader-ring-sm.sm  { width: 26px; height: 26px; }
    .loader-ring-sm.sm div  { width: 26px; height: 26px; border-width: 3px; margin: 0; }
    .loader-ring-sm.md  { width: 36px; height: 36px; }
    .loader-ring-sm.md div  { width: 36px; height: 36px; border-width: 3px; margin: 0; }
    .loader-ring-sm.lg  { width: 52px; height: 52px; }
    .loader-ring-sm.lg div  { width: 52px; height: 52px; border-width: 4px; margin: 0; }
    .loader-ring-lg     { width: 64px; height: 64px; }
    .loader-ring-lg div { width: 64px; height: 64px; border-width: 5px; margin: 0; border-color: rgba(99,102,241,0.9) transparent transparent transparent; }
    .loader-ring-sm div:nth-child(1), .loader-ring-lg div:nth-child(1) { animation-delay: -0.45s; }
    .loader-ring-sm div:nth-child(2), .loader-ring-lg div:nth-child(2) { animation-delay: -0.30s; }
    .loader-ring-sm div:nth-child(3), .loader-ring-lg div:nth-child(3) { animation-delay: -0.15s; }
    @keyframes ringRotate {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* ---- Fullscreen ring ---- */
    .loader-ring-lg { width: 64px; height: 64px; }
  `],
})
export class LoaderComponent {
  @Input() variant: LoaderVariant = 'spinner';
  @Input() size: LoaderSize = 'md';
  @Input() text?: string;
  @Input() subtext?: string;
  @Input() showLabel: boolean = false;
  @Input() color: string = 'indigo';

  get sizeClass(): string { return this.size; }

  get labelWrapClass(): string {
    return this.size === 'xs' || this.size === 'sm' ? 'flex-row' : 'flex-row';
  }

  get labelColorClass(): string {
    return 'text-slate-600 dark:text-slate-300';
  }
}
