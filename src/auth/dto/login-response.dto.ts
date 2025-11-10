export class LoginResponseDto {
  access_token!: string;
  refresh_token!: string;
  user!: {
    id: number;
    email: string;
    username: string;
    fullName: string;
  };
  expires_in!: number;
}

export class TokenDto {
  access_token!: string;
  refresh_token!: string;
  expires_in!: number;
}
