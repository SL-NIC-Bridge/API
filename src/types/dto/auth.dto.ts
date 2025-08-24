export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  divisionId?: string;
}

export interface AuthResponseDto {
  success: true;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: string;
      currentStatus: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface LogoutDto {
  refreshToken: string;
}