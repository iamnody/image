const multer = require('multer')
const path = require('path')

// ! multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads')
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '__' + file.originalname)
//   },
// })
// ! multer end
// ! sharp
const storage = multer.memoryStorage()
// ! sharp end

const fileFilter = (req, file, cb) => {
  const exts = /jpg|jpeg|png/
  const extname = exts.test(file.originalname.split('.').pop().toLowerCase())
  const mimetype = exts.test(file.mimetype.toLowerCase())
  if (extname && mimetype) {
    cb(null, true)
  } else {
    req.validationError = 'validationError'
    cb(null, false, req.validationError)
  }
}

module.exports = multer({
  storage,
  fileFilter,
})
