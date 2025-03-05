import { User } from './users/entities/users.entity';
import { Injectable } from "@nestjs/common";

@Injectable()
export class GlobalVariables {
  public static currentUser: User;
}