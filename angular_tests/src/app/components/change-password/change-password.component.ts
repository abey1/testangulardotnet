import { takeUntil } from 'rxjs/operators';
import { UserService } from './../../../services/user.service';
import { Subject } from 'rxjs/internal/Subject';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { User, UserPasswordChangeDto } from 'src/app/models/user.model';
import { GlobalDataService } from 'src/services/global-data.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
})
export class ChangePasswordComponent implements OnInit {
  loggedInUser: any = {
    id: '',
    email: '',
    roll: '',
    jwt: '',
    route: '',
  };
  destroyer$: Subject<void> = new Subject();

  private readonly DANGER: string = 'danger';
  private readonly SUCCESS: string = 'success';
  private readonly YOUR_PASSWORD_DOESNT_MATCH: string =
    "your password doesn't match";

  constructor(
    private globalDataService: GlobalDataService,
    private userService: UserService,
    private renderer: Renderer2
  ) {}

  @ViewChild('oldPassword', { static: true }) OldPassword:
    | ElementRef
    | undefined;
  @ViewChild('newPassword', { static: true }) NewPassword:
    | ElementRef
    | undefined;
  @ViewChild('confirmPassword', { static: true }) ConfirmPassword:
    | ElementRef
    | undefined;
  @ViewChild('alert', { static: true }) Alert: ElementRef | undefined;

  ngOnInit(): void {
    this.globalDataService.loggedInUser
      .pipe(takeUntil(this.destroyer$))
      .subscribe((loggedInUser) => (this.loggedInUser = loggedInUser));

    this.OldPassword?.nativeElement.addEventListener('focus', () => {
      this.hideAlert();
    });
    this.NewPassword?.nativeElement.addEventListener('focus', () => {
      this.hideAlert();
    });
    this.ConfirmPassword?.nativeElement.addEventListener('focus', () => {
      this.hideAlert();
    });
  }

  ngOnDestroy() {
    this.destroyer$.next();
    this.destroyer$.complete();
  }

  resetPassword() {
    if (
      this.NewPassword?.nativeElement.value !=
      this.ConfirmPassword?.nativeElement.value
    ) {
      this.showAlert(this.YOUR_PASSWORD_DOESNT_MATCH, this.DANGER);
    } else {
      let userPasswordChangeDto: UserPasswordChangeDto = {
        email: this.loggedInUser.email,
        oldPassword: this.OldPassword?.nativeElement.value,
        password: this.ConfirmPassword?.nativeElement.value,
        jwt: this.loggedInUser.jwt,
      };
      this.userService.resetPassword(userPasswordChangeDto).subscribe({
        next: (response) => {
          this.globalDataService.setLoggedInUser({
            ...this.loggedInUser,
            jwt: response.jwt,
          });
          this.backToDefault();
        },
        error: (error) => {
          console.log(error);
          this.handleError(JSON.stringify(error));
        },
      });
    }
  }

  backToDefault() {
    this.renderer.setProperty(this.OldPassword?.nativeElement, 'value', '');
    this.renderer.setProperty(this.NewPassword?.nativeElement, 'value', '');
    this.renderer.setProperty(this.ConfirmPassword?.nativeElement, 'value', '');
    this.showAlert('your password has been successfully changed', this.SUCCESS);
  }

  handleError(error: string) {
    let errorJson = JSON.parse(error);
    this.showAlert(errorJson.error, this.DANGER);
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
