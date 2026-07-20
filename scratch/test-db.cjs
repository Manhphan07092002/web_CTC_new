const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ctc_solar')
  .then(async () => {
    console.log('Connected');
    const settings = await mongoose.connection.collection('settings').find({}).toArray();
    console.log('Settings:', settings);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
