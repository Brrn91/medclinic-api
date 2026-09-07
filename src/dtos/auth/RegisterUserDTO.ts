import { UserRole } from "../../entities/User";

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}
