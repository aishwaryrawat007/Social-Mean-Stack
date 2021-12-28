import { Injectable } from '@angular/core'
import { Post } from './post.model'
import { Subject } from 'rxjs'
import { map } from 'rxjs/operators'
import { HttpClient } from '@angular/common/http'
import { cpuUsage } from 'process'

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = []
  private postsUpdated = new Subject<Post[]>()
  private totalPosts = new Subject()

  constructor(private http: HttpClient) {}

  getPost(pageSize: number, currentPage: number) {
    const queryParams = `?pageSize=${pageSize}&currentPage=${currentPage}`
    return this.http
      .get('http://localhost:3000/api/posts' + queryParams)
      .pipe(
        map((postData: any) => {
          return {
            posts: postData.posts.map((post) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
              }
            }),
            totalPosts: postData.totalPosts,
          }
        }),
      )
      .subscribe((postsData: any) => {
        this.posts = postsData.posts
        this.postsUpdated.next([...this.posts])
        this.totalPosts.next(postsData.totalPosts)
      })
  }

  getPostsUpdated() {
    return this.postsUpdated.asObservable()
  }

  getTotalPostsCount() {
    return this.totalPosts.asObservable()
  }

  getPostById(id: string) {
    return this.http.get('http://localhost:3000/api/posts/' + id)
  }

  addPost(post: Post) {
    const postData = new FormData()

    postData.append('title', post.title)
    postData.append('content', post.content)
    postData.append('image', post.image, post.title)

    this.http
      .post<{ message: string; post: Post }>(
        'http://localhost:3000/api/posts',
        postData,
      )
      .subscribe((responseData) => {
        if (responseData) {
          post.id = responseData.post.id
          post.imagePath = responseData.post.imagePath

          this.posts.push(post)
          this.postsUpdated.next([...this.posts])
        }
      })
  }

  updatePost(post: Post) {
    let postData
    let imgPath
    if (typeof post.image !== 'string') {
      imgPath = post.imagePath
      postData = new FormData()
      postData.append('id', post.id)
      postData.append('title', post.title)
      postData.append('content', post.content)
      postData.append('image', post.image, post.title)
    } else {
      imgPath = post.image
      postData = {
        id: post.id,
        title: post.title,
        content: post.content,
        imagePath: post.image, //as image now contains the unchanged imagePath for the post.
      }
    }
    this.http
      .put('http://localhost:3000/api/posts', postData)
      .subscribe((response: any) => {
        if (response) {
          const updatedPosts = [...this.posts]
          const oldPostIndex = updatedPosts.findIndex((p) => p.id === post.id)
          const newPost: Post = {
            id: post.id,
            title: post.title,
            content: post.content,
            imagePath: imgPath,
          }
          this.posts[oldPostIndex] = newPost
          this.postsUpdated.next([...this.posts])
        }
      })
  }

  deletePost(postId: string) {
    return this.http.delete('http://localhost:3000/api/posts/' + postId)
  }
}
