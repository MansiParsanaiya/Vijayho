const mongoose = require('mongoose');

const connection = async () => {
    try {

        // MongoDB Connection URL
        await mongoose.connect('mongodb+srv://parsaniyamansi8141:parsaniyamansi8141@cluster0.9q5t3bu.mongodb.net/vijayho_myProject_api')
        // await mongoose.connect('mongodb://0.0.0.0:27017/vijayho_api')
        console.log("Mongo Database Connectioned !")

    } catch (error) {
        console.log(error)
    }
}

module.exports = connection;