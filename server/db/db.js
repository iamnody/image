const mongoose = require('mongoose')
// mongoose.set('strictQuery', true)
mongoose
  .connect(
    process.env.MODE === 'pro'
      ? process.env.MONGO_URI_PRO
      : process.env.MONGO_URI_DEV
  )
  .then((conn) =>
    // process.env.MODE !== 'pro' &&
    console.log(`DB Connected: ${conn.connection.host}`)
  )
  .catch((err) => {
    if (process.env.NODE_ENV !== 'pro') {
      console.log(err)
      console.log('DB Error')
    }
    process.exit(1)
  })
