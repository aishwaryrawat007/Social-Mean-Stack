import { AfterViewInit, Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { map } from 'rxjs/operators'
import { Post } from '../post.model'
import { PostService } from '../post.service'
import { mimeType } from './mime-type.validator'

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent implements OnInit, AfterViewInit {
  editPostId: string
  mode: string = 'create'
  post: Post
  loading: boolean = false

  postForm: FormGroup
  imagePreview: string | ArrayBuffer

  constructor(
    public postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initForm()
    this.route.params.subscribe((params) => {
      if (params.id) {
        this.editPostId = params.id
        this.mode = 'edit'
        this.loading = true
        this.postService
          .getPostById(this.editPostId)
          .pipe(
            map((response: any) => {
              return {
                id: response.post._id,
                title: response.post.title,
                content: response.post.content,
                imagePath: response.post.imagePath
              }
            }),
          )
          .subscribe((post: any) => {
            this.post = post
            this.imagePreview = this.post.imagePath;
            this.postForm.patchValue({
              title: post.title,
              content: post.content,
              image: post.imagePath
            })
            this.loading = false
          })
      } else {
        this.mode = 'create'
        this.editPostId = null
      }
    })
  }

  initForm(): void {
    this.postForm = new FormGroup({
      title: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      content: new FormControl(null, [Validators.required]),
      image: new FormControl(null, {
        validators: [Validators.required],
        asyncValidators: [mimeType],
      }),
    })
  }
  ngAfterViewInit() {
    if (this.editPostId) {
    }
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0]
    this.postForm.patchValue({
      image: file,
    })
    //in cases where the control is not attached to the HTML form. This way we can forcefully check the validity of the value in the form.
    this.postForm.get('image').updateValueAndValidity()
    const reader = new FileReader()
    reader.onload = () => {
      this.imagePreview = reader.result
    }
    reader.readAsDataURL(file)
  }

  onAddEditPost(): void {
    this.loading = true

    if (this.postForm.valid) {
      const post: Post = {
        title: this.postForm.value.title,
        content: this.postForm.value.content,
        image: this.postForm.value.image
      }
      if (this.mode === 'create') {
        this.postService.addPost(post)
      } else {
        post.id = this.post.id;
        this.postService.updatePost(post)
      }
      this.postForm.reset()
      this.router.navigate(['/'])
    }
  }
}
