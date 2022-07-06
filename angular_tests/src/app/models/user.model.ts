export interface User {
  id: string;
  email: string;
  roll: string;
  jwt: string;
  route: string;
}

export interface UserRollAssign {
  id: string;
  email: string;
  roll: string;
}

export interface UserRegisterDto {
  email: '';
  password: '';
}

export interface UserPasswordChangeDto {
  email: string;
  oldPassword: string;
  password: string;
  jwt: string;
}

export interface UserEmailDto {
  email: string;
  password: string;
}

export interface AdminGetAllUserDto {
  id: string;
  jwt: string;
}

export interface ChangeRollDto {
  id: string;
  roll: string;
  jwt: string;
}

export interface DeleteUserDto {
  adminId: string;
  userId: string;
  jwt: string;
}
