import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})
export class ImgFallbackDirective {
  @Input() appImgFallback: string = 'assets/icons/placeholder.svg';

  constructor(private el: ElementRef) {}

  @HostListener('error')
  onError(): void {
    const element = this.el.nativeElement as HTMLImageElement;
    if (element.src !== this.appImgFallback) {
      element.src = this.appImgFallback;
    }
  }
}
