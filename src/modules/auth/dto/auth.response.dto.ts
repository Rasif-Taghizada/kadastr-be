import { UserRole } from '@/constants/enums';

export class AuthResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
}
