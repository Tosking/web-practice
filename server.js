const express = require('express')
const fs = require('fs')
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
const { createHash } = require('crypto');
const app = express()
const port = 3000
require('dotenv').config()
app.set('view engine', 'ejs');  

const { Client } = require('pg');
const pg = new Client({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: false,
})
pg.connect()

app.use("/style", express.static(path.join(__dirname, 'style')))
app.use(cookieParser());
app.use( bodyParser.json() );    
app.use(bodyParser.urlencoded({     
  extended: true
})); 

app.get('/', (req, res) => {
    let posts = []
    const result = pg.query(`SELECT * FROM posts ORDER BY points desc`, (err, result) => {
        
        if(result.rows.length == 0){
            return
        }
        for(let i = 0; i < result.rows.length; i++){
            posts.push(result.rows[i])
        }
        for(let i = 0; i < posts.length; i++){
            const result = pg.query(`SELECT name FROM users WHERE id = ${posts[i].author}`, (err, result) => {
                posts[i].name = result.rows[0].name
                if(i == posts.length - 1){
                    res.render("index", {
                        name: req.cookies.name,
                        id: req.cookies.id,
                        posts: posts
                    })
                }
            })
        }
    })
})

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/script.js'))
})

app.get('/auth/redirect.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/redirect.js'))
})

app.post("/auth/signin", (req, res) => {
    const pass = createHash('sha256').update(req.body.password).digest('hex')
    const result = pg.query(`SELECT id, name FROM users WHERE password = '${pass}' AND email = '${req.body.email}'`, (err, result) => {
        if(result.rows.length == 0){
            res.status(400).send("Email или пароль введены неверно")
            return
        }
        else {
            console.log(result)
            const randomNumber=createHash('sha256').update(req.body.password + req.body.email).digest('hex')
            res.cookie('cookie',randomNumber, { maxAge: 90000, httpOnly: true });
            res.cookie('id', result.rows[0].id)
            res.cookie('name', result.rows[0].name)
            res.sendStatus(200)
            return
        }
    })
})

app.post("/auth/signup", (req, res) => {
    console.log(req.body)
    if(req.body.name != null && req.body.password != null && req.body.email.match("^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$")){
        const pass = createHash('sha256').update(req.body.password).digest('hex')
        pg.query(`SELECT email FROM users WHERE email = '${req.body.email}'`, (err, result) => {
            if(result.rows.length == 0){
                pg.query(`INSERT INTO users (name, email, password) VALUES ('${req.body.name}', '${req.body.email}', '${pass}') RETURNING id, name;`, (err, result) => {
                    if(err){
                        throw err
                    }
                    const randomNumber=createHash('sha256').update(req.body.password + req.body.email).digest('hex')
                    res.cookie('cookie',randomNumber, { maxAge: 90000, httpOnly: true });
                    res.cookie('id', result.rows[0].id)
                    res.cookie('name', result.rows[0].name)
                    console.log("123")
                    res.sendStatus(200)
                    return
                })
            } else {
                console.log(result)
                res.status(400).send("Email exist")
                return
            }

        })
    }else{
        res.status(400).send("Error")
        return
    }
})

app.post("/user/post", (req, res) => {
    if(req.body.title != null){
        pg.query(`INSERT INTO posts (title, description, author) VALUES ('${req.body.title}', '${req.body.description}', ${req.cookies.id})`, (err, result) => {
            res.redirect("/")
        })
    }
})

app.post("/post/vote", (req, res) => {
    if(req.cookies.id != null){
        pg.query(`SELECT * FROM posts WHERE id = ${req.body.post}`, (err, result) => {
            let voted = null
            if(req.body.points == -1){      
                voted = 'no'   
            }
            else if(req.body.points == 1){
                voted = 'yes' 
            }
            else if(req.body.points == 0){
                pg.query(`SELECT liked FROM reactions WHERE post = ${req.body.post} AND userid = ${req.cookies.id}`, (err, resultLiked) => {
                    let liked = resultLiked.rows[0].liked
                    console.log(liked)
                    if(liked == 0){
                        liked = -1
                    }
                    pg.query(`DELETE FROM reactions WHERE post = ${req.body.post} AND userid = ${req.cookies.id}`)
                    pg.query(`UPDATE posts SET points = ${result.rows[0].points - +req.body.points} WHERE id = ${req.body.post}`)
                })
                return
            }
            pg.query(`SELECT * FROM reactions WHERE post = ${req.body.post} AND userid = ${req.cookies.id}`, (err, resultLiked) => {
                if(resultLiked.rows.length == 0){
                    pg.query(`INSERT INTO reactions (userid, post, liked) VALUES (${req.cookies.id}, ${req.body.post}, '${voted}')`)
                    pg.query(`UPDATE posts SET points = ${+result.rows[0].points + +req.body.points} WHERE id = ${req.body.post}`)
                }
            })
        }) 
    }
})

app.get("/user/votes", (req, res) => {
    pg.query(`SELECT post, liked FROM reactions WHERE userid = ${req.cookies.id} ORDER BY post`, (err, result) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(result.rows))
    })
})


app.listen(port, () => {
    console.log("server started at port 3000")
})
