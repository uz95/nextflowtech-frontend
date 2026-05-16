import { Component, OnInit, inject } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  readonly loading = inject(LoadingService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((event) =>
        event instanceof NavigationStart ||
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.loading.show();
          return;
        }

        this.loading.hide();
      });
  }
}
