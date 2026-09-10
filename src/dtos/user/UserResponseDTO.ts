import { UserRole } from "../../entities/User";

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}
