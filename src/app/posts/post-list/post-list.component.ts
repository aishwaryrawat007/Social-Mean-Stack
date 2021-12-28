import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostService } from '../post.service';



@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {


  @Input("posts") posts: Post[] = [];
  private postSub: Subscription[] = [];
  loading: boolean = true;
  totalPosts = 10;
  postsPerPage = 2;
  pageSizeOptions = [1,2,5,10];
  currentPage: number;
  pageData: PageEvent;
  isUserAuthenticated: boolean = false;


  constructor(private postService: PostService, private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    this.postSub.push(this.authService.getAuthStatusListener().subscribe(status => {
      if(status){
        this.isUserAuthenticated = status;
      }
    }));
  this.postService.getPost(this.postsPerPage, 1);
   this.postSub.push(this.postService.getPostsUpdated().subscribe(newPosts => {
    this.posts = newPosts;
    this.loading = false;
   }));

   this.postService.getTotalPostsCount().subscribe((count: any) => {
     this.totalPosts = count;
   })
  }

  ngOnDestroy(): void{
    this.postSub.forEach(sub => {
      sub.unsubscribe();
    });
  }

  onDelete(postId: string){
    this.postService.deletePost(postId).subscribe(response => {
      if(response){
        let currentPage = this.currentPage;
        if(this.pageData.previousPageIndex == 0){
          currentPage = 1
        }
        this.postService.getPost(this.postsPerPage, currentPage);
      }
    });
  }

  onEdit(postId: string){
    this.router.navigate(["/edit/"+postId]);
  }

  onChangePage(pageData: PageEvent){
    console.log(pageData);
    this.pageData = pageData
    this.postsPerPage = pageData.pageSize;
    this.currentPage = pageData.pageIndex + 1;
    this.postService.getPost(this.postsPerPage, this.currentPage);
  }
}
