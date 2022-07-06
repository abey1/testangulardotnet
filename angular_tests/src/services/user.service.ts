import { DeleteUserDto } from './../app/models/user.model';
import { HttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';
import {
  UserEmailDto,
  UserRegisterDto,
  AdminGetAllUserDto,
  UserPasswordChangeDto,
  ChangeRollDto,
} from 'src/app/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseUrl = 'https://localhost:7118/api/auth';

  constructor(private http: HttpClient) {}

  //register user
  registerUser(user: UserRegisterDto) {
    return this.http.post<UserRegisterDto>(this.baseUrl + '/register', user);
  }

  loginUser(user: UserEmailDto) {
    return this.http.post<UserEmailDto>(this.baseUrl + '/login', user);
  }

  getAllUser(adminGetAllUserDto: AdminGetAllUserDto) {
    return this.http.post<AdminGetAllUserDto>(
      this.baseUrl + '/get-all-user',
      adminGetAllUserDto
    );
  }

  resetPassword(userPasswordChangeDto: UserPasswordChangeDto) {
    return this.http.post<UserPasswordChangeDto>(
      this.baseUrl + '/reset-password',
      userPasswordChangeDto
    );
  }

  changeRoll(changeRollDto: ChangeRollDto) {
    return this.http.post<ChangeRollDto>(
      this.baseUrl + '/add-roll',
      changeRollDto
    );
  }

  deleteUser(deleteUserDto: DeleteUserDto) {
    return this.http.post<DeleteUserDto>(
      this.baseUrl + '/delete',
      deleteUserDto
    );
  }
}
