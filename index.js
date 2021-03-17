const express = require('express')

const fs = require('fs')

const { exec } = require('child_process')

const path = require('path')

const multer = require('multer')

const bodyParser = require('body-parser')

const app = express()

var dir = 'public';
var subDirectory = 'public/uploads'

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);

    fs.mkdirSync(subDirectory)

}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({storage:storage})

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.static('public'))

const PORT = process.env.PORT || 3000

app.get('/',(req,res) => {
    res.sendFile(__dirname +'/index.html')
})

app.post('/get_mp4',upload.single('file'),(req,res,next) => {
    if(req.file){

        var output = req.file.filename + ".mp4"

        exec(`ffmpeg -i ${req.file.path} -qscale 0 ${output}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            else{
            res.download(output,(err) => {
                if(err) throw err
                
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(output)

                next()

            })
        }
        })
    }
})

app.listen(PORT,() => {
    console.log(`App is listening on Port ${PORT}`)
})