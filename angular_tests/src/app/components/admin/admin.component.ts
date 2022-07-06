import {
  AdminGetAllUserDto,
  ChangeRollDto,
  DeleteUserDto,
} from './../../models/user.model';
import { UserService } from './../../../services/user.service';
import { takeUntil } from 'rxjs/operators';
import { GlobalDataService } from './../../../services/global-data.service';
import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';

import { UserRollAssign } from 'src/app/models/user.model';
import { Subject } from 'rxjs/internal/Subject';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  loggedInUser: any;
  destroyer$: Subject<void> = new Subject();

  allUsers: UserRollAssign[] = [];

  rolls = [
    {
      id: 1,
      label: '',
    },
    {
      id: 2,
      label: 'admin',
    },
    {
      id: 3,
      label: 'teacher',
    },
    {
      id: 4,
      label: 'student',
    },
  ];

  constructor(
    private globalDataService: GlobalDataService,
    private userService: UserService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.globalDataService.loggedInUser
      .pipe(takeUntil(this.destroyer$))
      .subscribe((loggedInUser) => (this.loggedInUser = loggedInUser));
    this.getAllUsers();
  }

  ngOnDestroy() {
    this.destroyer$.next();
    this.destroyer$.complete();
  }

  showAreYouSure(id: string) {
    let yesNoList = document.querySelectorAll('.yesnoholder');
    yesNoList.forEach((element) => {
      this.renderer['addClass'](element, 'hide-yes-no');
    });
    this.renderer['removeClass'](
      document.querySelector('#ynholder' + id),
      'hide-yes-no'
    );
    this.renderer['addClass'](
      document.querySelector('#ynholder' + id),
      'display-yes-no'
    );
  }

  hideAreYouSure(id: string) {
    this.renderer['addClass'](
      document.querySelector('#ynholder' + id),
      'hide-yes-no'
    );
  }

  deleteUser(id: string) {
    let deleteUserDto: DeleteUserDto = {
      adminId: this.loggedInUser.id,
      userId: id,
      jwt: this.loggedInUser.jwt,
    };
    this.userService.deleteUser(deleteUserDto).subscribe({
      next: (response) => {
        //save the new jwt in logged in user
        this.globalDataService.setLoggedInUser({
          ...this.loggedInUser,
          jwt: response.jwt,
        });
        //document.getElementById('id' + id)?.classList.add('stroke-through');
        console.log('#id' + id);

        //strike through the id
        this.renderer['addClass'](
          document.querySelector('#id' + id),
          'stroke-through'
        );

        //strike through the email
        this.renderer['addClass'](
          document.querySelector('#email' + id),
          'stroke-through'
        );

        //disable the dropdown
        this.renderer.setProperty(
          document.querySelector('#roll' + id),
          'disabled',
          'disabled'
        );

        //hide delete button
        this.renderer.setStyle(
          document.querySelector('#delete' + id),
          'display',
          'none'
        );
      },
      error: (error) => {},
    });
    this.renderer['addClass'](
      document.querySelector('#ynholder' + id),
      'hide-yes-no'
    );
  }

  changeRoll(event: Event, id: string) {
    // let userId = (event.target as HTMLInputElement).id;
    let userId = id;
    let newRoll = (event.target as HTMLInputElement).value;

    let changeRollDto: ChangeRollDto = {
      id: userId,
      roll: newRoll,
      jwt: this.loggedInUser.jwt,
    };
    console.log(changeRollDto);

    this.userService.changeRoll(changeRollDto).subscribe({
      next: (response) => {
        console.log(response);
        // assign the refreshed jwt
        this.globalDataService.setLoggedInUser({
          ...this.loggedInUser,
          jwt: response.jwt,
        });
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  getAllUsers() {
    let adminGetAllUserDto: AdminGetAllUserDto = {
      id: this.loggedInUser.id,
      jwt: this.loggedInUser.jwt,
    };
    this.userService.getAllUser(adminGetAllUserDto).subscribe({
      next: (response) => {
        this.allUsers = JSON.parse(JSON.stringify(response)).userEmailRolls;
      },
      error: (response) => {
        console.log(JSON.parse(JSON.stringify(response)));
      },
    });
  }
}
