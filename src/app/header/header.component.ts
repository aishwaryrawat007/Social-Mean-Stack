import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  isUserLoggedIn: boolean = false;
  authSubscriber: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authSubscriber = this.authService.getAuthStatusListener().subscribe(status => {
      this.isUserLoggedIn = status;
    })
  }

  logout(){
    this.authService.logoutUser();
  }

  ngOnDestroy(): void {
    this.authSubscriber.unsubscribe();
  }
}
