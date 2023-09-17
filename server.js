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
    console.log(req.cookies)
    res.render("index", {
        name: req.cookies.name,
        id: req.cookies.id
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
            const randomNumber=createHash('sha256').update(Math.random().toString()).digest('hex')
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
                    const randomNumber=createHash('sha256').update(Math.random().toString()).digest('hex')
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


app.listen(port, () => {
    console.log("server started at port 3000")
})
