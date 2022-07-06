import { GlobalDataService } from './../../../services/global-data.service';
import { UserService } from './../../../services/user.service';
import { UserRegisterDto, User } from './../../models/user.model';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  @ViewChild('email', { static: true }) Email: ElementRef | undefined;
  @ViewChild('password', { static: true }) Password: ElementRef | undefined;
  @ViewChild('confirmPassword', { static: true }) ConfirmPassword:
    | ElementRef
    | undefined;
  @ViewChild('alert', { static: true }) Alert: ElementRef | undefined;

  constructor(
    private globalData: GlobalDataService,
    private userService: UserService,
    private renderer: Renderer2,
    private router: Router
  ) {}

  private readonly DANGER: string = 'danger';
  private readonly SUCCESS: string = 'success';

  ngOnInit(): void {
    //add focus event handler on the inputs
    this.Email?.nativeElement.addEventListener('focus', () => {
      this.hideAlert();
    });
    this.Password?.nativeElement.addEventListener('focus', () => {
      this.hideAlert();
    });
    this.ConfirmPassword?.nativeElement.addEventListener('focus', () => {
      this.hideAlert();
    });
  }

  register() {
    if (
      this.Password?.nativeElement.value ==
      this.ConfirmPassword?.nativeElement.value
    ) {
      // object to be sent to the server
      let userRegisterDto: UserRegisterDto = {
        email: this.Email?.nativeElement.value,
        password: this.Password?.nativeElement.value,
      };

      // send the object to server
      this.userService.registerUser(userRegisterDto).subscribe({
        next: (res) => {
          let newUser = JSON.parse(JSON.stringify(res));
          // get jwt and id from response
          var newJwt = newUser.jwt;
          var newId = newUser.id;

          // create user
          let user: User = {
            id: newId,
            email: this.Email?.nativeElement.value,
            roll: '',
            jwt: newJwt,
            route: '',
          };
          this.handleSuccessfulRegister(user);
        },
        error: (res) => {
          console.log(JSON.parse(JSON.stringify(res)));
          this.handleError(JSON.stringify(res));
        },
      });
    } else {
      this.showAlert("password does'nt match", this.DANGER);
    }
  }

  handleSuccessfulRegister(user: User) {
    //make the fields empty
    this.renderer.setProperty(this.Email?.nativeElement, 'value', '');
    this.renderer.setProperty(this.Password?.nativeElement, 'value', '');
    this.renderer.setProperty(this.ConfirmPassword?.nativeElement, 'value', '');
    this.showAlert('you are successfully registered', this.SUCCESS);
    setTimeout(() => {
      this.globalData.setLoggedInUser(user);
      this.openMyRoll();
    }, 1000);
  }

  handleError(error: string) {
    let errorJson = JSON.parse(error);
    this.showAlert(errorJson.error, this.DANGER);
  }

  showAlert(text: string, status: string) {
    this.renderer['addClass'](this.Alert?.nativeElement, 'show-alert');
    this.renderer['removeClass'](this.Alert?.nativeElement, 'hide-alert');
    if (status === this.SUCCESS) {
      this.renderer.setStyle(this.Alert?.nativeElement, 'color', 'green');
    }
    if (status === this.DANGER) {
      this.renderer.setStyle(this.Alert?.nativeElement, 'color', 'red');
    }
    this.renderer.setProperty(this.Alert?.nativeElement, 'innerText', text);
  }

  hideAlert() {
    this.renderer['removeClass'](this.Alert?.nativeElement, 'show-alert');
    this.renderer['addClass'](this.Alert?.nativeElement, 'hide-alert');
  }

  openMyRoll() {
    this.router.navigate(['/contact-your-admin'], { skipLocationChange: true });
  }
}
