import {
  trigger, state, style, animate, transition, query, stagger, keyframes
} from '@angular/animations';

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(8px)' }),
    animate('180ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate('200ms ease-out', style({ transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'translateX(100%)' })),
  ]),
]);

export const modalAnimation = trigger('modalAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.95)' }),
    animate('180ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' })),
  ]),
  transition(':leave', [
    animate('150ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0, transform: 'scale(0.95)' })),
  ]),
]);

export const backdropAnimation = trigger('backdropAnimation', [
  transition(':enter', [style({ opacity: 0 }), animate('180ms ease', style({ opacity: 1 }))]),
  transition(':leave', [animate('150ms ease', style({ opacity: 0 }))]),
]);

export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(10px)' }),
      stagger(40, animate('160ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))),
    ], { optional: true }),
  ]),
]);

export const cartItemAnimation = trigger('cartItemAnimation', [
  transition(':enter', [
    style({ opacity: 0, height: 0, transform: 'translateX(-10px)' }),
    animate('180ms ease-out', style({ opacity: 1, height: '*', transform: 'translateX(0)' })),
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0, height: 0, transform: 'translateX(-10px)' })),
  ]),
]);

export const counterAnimation = trigger('counterAnimation', [
  transition('* => *', [
    animate('200ms ease', keyframes([
      style({ transform: 'scale(1.2)', offset: 0.5 }),
      style({ transform: 'scale(1)', offset: 1 }),
    ])),
  ]),
]);

export const slideOut = trigger('slideOut', [
  transition(':enter', [
    style({ transform: 'translateY(0)', opacity: 1 }),
    animate('200ms ease-in', style({ transform: 'translateY(-100%)', opacity: 0 })),
  ]),
]);

export const slideIn = trigger('slideIn', [
  transition(':enter', [
    style({ transform: 'translateY(100%)', opacity: 0 }),
    animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
  ]),
]);

export const pageTransition = trigger('pageTransition', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);

/**
 * Spin-in animation for the theme icon when the theme switches.
 *
 * IMPORTANT: must be `:enter` only — NOT `* => *`. The `*` wildcard also
 * matches the `void` state, so `* => *` would run a `:leave` transition too,
 * keeping the OLD icon in the DOM for the animation duration and showing
 * BOTH sun/moon icons at once. With `:enter` the outgoing icon is removed
 * instantly and only the new icon is ever visible.
 * Bind it as a bare `[@themeRotate]` — no value is needed since `:enter`
 * fires on element insertion.
 */
export const themeRotate = trigger('themeRotate', [
  transition(':enter', [
    style({ opacity: 0, transform: 'rotate(-180deg) scale(0.6)' }),
    animate('500ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'rotate(0deg) scale(1)' })),
  ]),
]);
