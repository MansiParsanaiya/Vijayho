const mongoose = require('mongoose');

const connection = async () => {
    try {

        // MongoDB Connection URL
        await mongoose.connect('mongodb://0.0.0.0:27017/vijayho_api')
        console.log("Mongo Database Connectioned ! ")

    } catch (error) {
        console.log(error)
    }
}

module.exports = connection;

// Connect to MongoDB
// mongoose.connect('mongodb://localhost/studentAttendance', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// https://vijayhoapi.onrender.com