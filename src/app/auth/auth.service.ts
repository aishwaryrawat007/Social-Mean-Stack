import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthData} from './auth-data.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService{
  private authToken: string;
  private authStatusListener = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router){
  }

  createUser(email: string, password: string){
    const authData : AuthData = {
      email: email,
      password: password
    }
    this.http.post("http://localhost:3000/api/user/signup", authData).subscribe(response => {
      console.log(response);
    })
  }

  loginUser(email: string, password: string){
    const authData: AuthData = {
      email: email,
      password: password
    }

    this.http.post<any>("http://localhost:3000/api/user/login", authData).subscribe(response => {
      if(response.token){
        this.authToken = response?.token;
        this.authStatusListener.next(true);
        this.router.navigate(["/"]);
      }

    })
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  getToken(){
    return this.authToken;
  }

  logoutUser(){
    this.authToken = null;
    this.authStatusListener.next(false);
    this.router.navigate(["/"]);
  }
}
