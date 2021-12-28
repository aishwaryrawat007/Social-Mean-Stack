const express = require('express');

const Post = require("../models/post");

const router = express.Router();

const checkAuth = require("../middleware/check-auth");

const multer = require('multer');

const MIME_TYPE = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg'
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { // the callback takes error and the path where we want to save the file
        const isValid = MIME_TYPE[file.mimetype];
        let error = new Error('Invalid MIME Type');
        if (isValid) {
            error = null;
        }
        cb(error, "backend/images");
    },
    filename: (req, file, cb) => {
        const name = file.originalname.toLowerCase().split(' ').join('-');
        const ext = MIME_TYPE[file.mimetype];
        cb(null, name + '-' + Date.now() + '.' + ext);
    }
})


// Post request API
router.post("", checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        imagePath: url + "/images/" + req.file.filename
    });
    post.save().then(newPost => {
        res.status(201).json({
            message: 'Post added successfully',
            post: {
                id: newPost._id,
                title: newPost.title,
                content: newPost.content,
                imagePath: newPost.imagePath
            }
        })
    });

})


// GET request API
router.get("", (req, res, next) => {
    const currentPage = + req.query.currentPage;
    const pageSize = + req.query.pageSize;

    const postQuery = Post.find();
    let fetchedPosts;

    if (currentPage && pageSize) {
        postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
    }

    postQuery.then(documents => {
        fetchedPosts = documents;
        return Post.count();
    }).then(count => {
        res.status(200).json({message: 'Posts fetch successfully', posts: fetchedPosts, totalPosts: count});
    })

})

// GET post by ID API
router.get("/:id", (req, res, next) => {
    Post.findById(req.params.id).then(document => {
        res.status(200).json({message: 'Post fetched successfully', post: document})
    })

})

// Update request API
router.put("",checkAuth, multer({storage: storage}).single("image"), (req, res, next) => {
    let newImagePath;
    if (req.file) {
        const url = req.protocol + "://" + req.get("host");
        newImagePath = url + "/images/" + req.file.filename
    }
    console.log("new Image path", newImagePath);
    console.log("Old Image path", req.body.imagePath);
    const post = new Post({
        _id: req.body.id,
        title: req.body.title,
        content: req.body.content,
        imagePath: req.file ? newImagePath : req.body.imagePath
    });
    console.log("updated Post", post);
    Post.updateOne({
        _id: req.body.id
    }, post).then(result => {
        console.log(result);
        res.status(200).json({message: "Update Successfull"})
    })
})


// DELETE request API
router.delete("/:id",checkAuth, (req, res, next) => {
    Post.deleteOne({_id: req.params.id}).then(result => {
        console.log(result);
        res.status(200).json({message: "Post deleted"})
    })

})

module.exports = router;
