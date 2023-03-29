const mongoose = require('mongoose')

const imageSchema = mongoose.Schema(
  {
    path: {
      type: String,
      required: true,
      default: 'uploads/a.jpg',
    },
    originalname: {
      type: String,
      required: true,
      default: 'a.jpg',
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Image', imageSchema)
