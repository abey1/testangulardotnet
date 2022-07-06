import { UserEmailDto } from './../../models/user.model';
import { UserService } from './../../../services/user.service';
import { GlobalDataService } from './../../../services/global-data.service';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { User, UserRegisterDto } from 'src/app/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  user: User = {
    id: '',
    email: '',
    roll: '',
    jwt: '',
    route: '',
  };

  @ViewChild('email', { static: true }) Email: ElementRef | undefined;
  @ViewChild('alert', { static: true }) Alert: ElementRef | undefined;
  @ViewChild('password', { static: true }) Password: ElementRef | undefined;

  //@Output() login = new EventEmitter<User>();
  constructor(
    private globalDataService: GlobalDataService,
    private router: Router,
    private userService: UserService,
    private renderer: Renderer2
  ) {}

  private readonly DANGER: string = 'danger';
  private readonly SUCCESS: string = 'success';
  private readonly STUDENT: string = 'student';
  private readonly TEACHER: string = 'teacher';
  private readonly ADMIN: string = 'admin';

  ngOnInit(): void {
    //add focus event listener to remove alert
    this.Email?.nativeElement.addEventListener('focus', () => {
      if (this.Email != undefined) {
        if (document.activeElement === this.Email?.nativeElement) {
          this.hideAlert();
        }
      }
    });
    this.Password?.nativeElement.addEventListener('focus', () => {
      if (this.Password != undefined) {
        if (document.activeElement === this.Password?.nativeElement) {
          this.hideAlert();
        }
      }
    });
  }

  login() {
    let inputEmail: string = this.Email?.nativeElement.value;
    let inputPassword: string = this.Password?.nativeElement.value;

    let userEmailDto: UserEmailDto = {
      email: inputEmail,
      password: inputPassword,
    };

    this.userService.loginUser(userEmailDto).subscribe({
      next: (response) => {
        let userInput = JSON.parse(JSON.stringify(response));
        let user: User = {
          id: userInput.id,
          email: inputEmail,
          roll: userInput.roll ? userInput.roll : '',
          jwt: userInput.jwt,
          route: '',
        };
        this.handleSuccessfulLogin(user);
      },
      error: (response) => {
        this.handleError(JSON.stringify(response));
      },
    });
  }

  handleSuccessfulLogin(user: User) {
    this.globalDataService.setLoggedInUser(user);
    this.user = user;
    this.showAlert('you have successfully logged in', this.SUCCESS);
    setTimeout(() => {
      if (user.roll == this.STUDENT) {
        this.openStudentPage();
      } else if (user.roll == this.TEACHER) {
        this.openTeacherPage();
      } else if (user.roll == this.ADMIN) {
        this.openAdminPage();
      } else {
        this.openMyRoll();
      }
    }, 1000);
  }

  handleError(error: string) {
    let errorJson = JSON.parse(error);
    this.showAlert(errorJson.error.statusText, this.DANGER);
  }

  openAdminPage() {
    this.router.navigate(['/admin'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalDataService.setLoggedInUser({
      ...this.user,
      route: '/admin',
    });
  }

  openStudentPage() {
    this.router.navigate(['/student'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalDataService.setLoggedInUser({
      ...this.user,
      route: '/student',
    });
  }

  openTeacherPage() {
    this.router.navigate(['/teacher'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalDataService.setLoggedInUser({
      ...this.user,
      route: '/teacher',
    });
  }

  openMyRoll() {
    this.router.navigate(['/contact-your-admin'], { skipLocationChange: true });
    //assign the route on the global data service user
    this.globalDataService.setLoggedInUser({
      ...this.user,
      route: '/contact-your-admin',
    });
  }

  showAlert(text: string, status: string) {
    this.renderer['removeClass'](this.Alert?.nativeElement, 'hide-alert');
    this.renderer['addClass'](this.Alert?.nativeElement, 'show-alert');
    status == this.SUCCESS
      ? this.renderer.setStyle(this.Alert?.nativeElement, 'color', 'green')
      : this.renderer.setStyle(this.Alert?.nativeElement, 'color', 'red');
    this.renderer.setProperty(this.Alert?.nativeElement, 'innerText', text);
  }

  hideAlert() {
    this.renderer['removeClass'](this.Alert?.nativeElement, 'show-alert');
    this.renderer['addClass'](this.Alert?.nativeElement, 'hide-alert');
  }
}
