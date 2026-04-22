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

export const pageTransition = trigger('pageTransition', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(12px)' }),
    animate('220ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
  ]),
]);
