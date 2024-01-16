const express = require('express')
require('dotenv').config()
const morgan = require('morgan')
const cors = require('cors')
require('./db/db')
const Image = require('./models/imageModel')
const upload = require('./middleware/imageUploadMiddleware')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const app = express()
if (process.env.MODE !== 'pro') {
  app.use(morgan('dev'))
}
app.use(cors())
app.use(express.json())

app.post(
  '/api/upload/uploadImages',
  upload.array('files'),
  async (req, res) => {
    if (req.validationError) {
      res.status(500).json({ message: 'Internal Server Error' })
      return
    }
    const images = []
    for await (const x of req.files) {
      // ! sharp
      const path = 'uploads/' + Date.now() + '__' + x.originalname
      await sharp(x.buffer).resize(100, 100).toFile(path)
      // ! sharp end
      const image = await Image.create({
        path: path,
        originalname: x.originalname,
      })
      images.push(image)
    }
    const maxNum = 15
    const count = await Image.find().count()
    if (count > maxNum) {
      const deleteNum = count - maxNum
      Array.from(Array(deleteNum), async (_, i) => {
        await Image.deleteOne()
      })
    }
    const directory = 'uploads'
    const files = fs.readdirSync(directory).reverse()
    for (const [i, x] of files.entries()) {
      if (i >= maxNum) {
        fs.unlinkSync(path.join(directory, x))
      }
    }
    res.status(201).json(images)
  }
)

app.get('/api/getImages', async (req, res) => {
  let images = await Image.find().limit(12).sort({ createdAt: -1 })
  res.status(200).json(images)
})

app.delete('/api/deleteAll', async (req, res) => {
  const directory = 'uploads'
  const files = fs.readdirSync(directory)
  for (const file of files) {
    fs.unlinkSync(path.join(directory, file))
  }
  await Image.deleteMany()
  res.status(200).json('deleted')
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

if (process.env.MODE === 'pro') {
  app.use(express.static(path.join(__dirname, '../client/build')))
  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
  })
}

const PORT = process.env.PORT || 5014
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
