import { User } from 'src/app/models/user.model';
import { GlobalDataService } from './../services/global-data.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/internal/Subject';
import { map, tap, takeUntil, filter } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  loggedInUser: User = {
    id: '',
    email: '',
    roll: '',
    jwt: '',
    route: '',
  };
  destroyer$: Subject<void> = new Subject();

  constructor(private globalData: GlobalDataService, private router: Router) {}

  ngOnInit() {
    this.globalData.loggedInUser
      .pipe(takeUntil(this.destroyer$))
      .subscribe((loggedInUser) => (this.loggedInUser = loggedInUser));

    // runs after refresh
    this.router.events
      .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.id === 1 && event.url === event.urlAfterRedirects) {
          let value: any = localStorage.getItem('loggedUser');
          if (value != undefined) {
            console.log(JSON.parse(value));
            this.globalData.setLoggedInUser(JSON.parse(value));
            this.router.navigate([this.loggedInUser.route], {
              skipLocationChange: true,
            });
          }
        }
      });
  }

  ngOnDestroy() {
    this.destroyer$.next();
    this.destroyer$.complete();
  }

  logout() {
    this.globalData.setLoggedInUser({
      id: '',
      email: '',
      roll: 'unassigned',
      jwt: '',
      route: '',
    });
    this.openHomePage();
  }

  openHomePage() {
    this.router.navigate(['/'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalData.setLoggedInUser({ ...this.loggedInUser, route: '/' });
  }

  openLoginPage() {
    this.router.navigate(['/login'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalData.setLoggedInUser({ ...this.loggedInUser, route: '/login' });
  }

  openRegisterPage() {
    this.router.navigate(['/register'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalData.setLoggedInUser({
      ...this.loggedInUser,
      route: '/register',
    });
  }

  openStudentPage() {
    this.router.navigate(['/student'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalData.setLoggedInUser({
      ...this.loggedInUser,
      route: '/student',
    });
  }

  openTeacherPage() {
    this.router.navigate(['/teacher'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalData.setLoggedInUser({
      ...this.loggedInUser,
      route: '/teacher',
    });
  }

  openAdminPage() {
    this.router.navigate(['/admin'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalData.setLoggedInUser({ ...this.loggedInUser, route: '/admin' });
  }

  openChangePasswordPage() {
    this.router.navigate(['/change-password'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalData.setLoggedInUser({
      ...this.loggedInUser,
      route: '/change-password',
    });
  }

  openContactAdminPage() {
    this.router.navigate(['/contact-your-admin'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalData.setLoggedInUser({
      ...this.loggedInUser,
      route: '/contact-your-admin',
    });
  }
}
