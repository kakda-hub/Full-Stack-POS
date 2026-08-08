import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ThemeService } from '../../services/shared/theme.service';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-page-not-found',
  standalone: false,
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss',
})
export class PageNotFoundComponent implements OnInit {

  title = new BehaviorSubject<string>('');

  constructor(
    public theme: ThemeService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.title.next('404 – Page Not Found');
  }

  goBack(): void {
    this.location.back();
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
