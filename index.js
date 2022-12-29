const express = require('express');
var cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.aw5zzia.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {
        const usersCollection = client.db('postbookDB').collection('users');
        const postsCollection = client.db('postbookDB').collection('posts');
        const commentsCollection = client.db('postbookDB').collection('comments');

        //Users
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            res.send(user);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const existingUser = await usersCollection.findOne(filter);
            if (existingUser) {
                res.send({ message: 'User already exists' });
            }
            else {
                const result = await usersCollection.insertOne(user);
                res.send(result);
            }
        });

        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = req.body;
            const updatedDoc = {
                $set: {
                    name: user.name,
                    email: user.email,
                    institution: user.institution,
                    address: user.address
                }
            }
            const options = { upsert: true };
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        //Posts
        app.get('/posts', async (req, res) => {
            const query = {};
            const posts = await postsCollection.find(query).toArray();
            res.send(posts);
        });

        app.get('/posts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const post = await postsCollection.findOne(filter);
            console.log(post?.loveCount);
            res.send(post);
        });

        app.post('/posts', async (req, res) => {
            const post = req.body;
            post.loveCount = 0;
            const result = await postsCollection.insertOne(post);
            res.send(result);
        });

        app.get('/posts/love', async (req, res) => {
            const query = {};
            const posts = await postsCollection.find(query).toArray();
            res.send(posts);
        });

        let count = 0;
        app.put('/posts/addLove/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            count++;
            const updatedDoc = {
                $set: {
                    loveCount: count
                }
            }
            const options = { upsert: true };
            const result = await postsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        app.put('/posts/removeLove/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            count--;
            const updatedDoc = {
                $set: {
                    loveCount: count
                }
            }
            const options = { upsert: true };
            const result = await postsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        //Top posts
        app.get('/topPosts', async (req, res) => {
            const query = {};
            const topPosts = await postsCollection.find(query).sort({ loveCount: -1 }).limit(1);
            res.send(topPosts);
        });

        //Comments
        app.post('/comments', async (req, res) => {
            const commentInfo = req.body;
            const result = await commentsCollection.insertOne(commentInfo);
            res.send(result);
        });

        app.get('/comments/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { postId: id };
            const comments = await commentsCollection.find(filter).toArray();
            res.send(comments);
        });

        //Details
        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await postsCollection.findOne(filter);
            res.send(result);
        });

    }
    finally {

    }
}

run().catch(err => console.error(err));

app.get('/', (req, res) => {
    res.send('API running');
})

app.listen(port, () => {
    console.log('Server is running on port', port);
})