const express = require('express');
const fs = require('fs')
const path = require('path');
const app = express()
const port = 3000

app.use("/style", express.static(path.join(__dirname, 'style')))

console.log("style")

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, '/script.js'))
})


app.listen(port, () => {
    console.log("server started at port 3000")
})
