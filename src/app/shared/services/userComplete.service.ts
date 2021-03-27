import {Injectable} from '@angular/core';
import {HttpService} from '@core/http.service';
import {Observable, of} from 'rxjs';
import {User} from '@shared/models/userRegister.model';
import {UserInfoModel} from '../../shop/users/models/user-info.model';
import {EndPoints} from '@shared/end-points';
import {AuthService} from '@core/auth.service';


@Injectable({
  providedIn: 'root',
})
export class UserCompleteService {

  private users: User[];

  constructor(private httpService: HttpService, private authService: AuthService) {
  }

  searchCompleteUser(mobile: number): Observable<User> {
    return this.httpService
      .get(EndPoints.ADMIN + '/' + mobile);
  }

  getCompleteUsers(): Observable<User[]> {
    return this.httpService
      .get(EndPoints.ADMIN);
  }

  getBasicUsersInfo(): Observable<any[]> {
    return of(this.users.map(user => new UserInfoModel(user.mobile, user.firstName, user.role)));
  }

  setCompleteUser(oldMobile: number, newUser: User): Observable<User>{
    return this.httpService
      .successful()
      .put(EndPoints.ADMIN + '/' + oldMobile, newUser);
  }

  createCompleteUser(user: User): Observable<User>{
    return this.httpService
      .post(EndPoints.ADMIN + '/' + this.authService.getRole(), user);
  }

  checkUser(mobile: number): boolean {
    return (this.users.find( user => user.mobile == mobile)) ? true : false;
  }

  deleteCompleteUser(mobile: number): Observable<User[]>{
      return  this.httpService
        .delete(EndPoints.ADMIN + '/' + mobile);
  }
}
