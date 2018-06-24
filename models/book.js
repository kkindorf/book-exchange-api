const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var User = require('./user');
const BookSchema = new Schema ({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    badRequest: {
        type: String
    },
    title: {
        type: String
    },
    image: {
        type: String
    },
    authors: {
        type: [String]
    },
    previewLink: {
        type: String
    },
    tradeRequested: {
        type: Boolean,
        default: false
    },
    //if owner approves trade, requestor will be notified by turning tradeAccepted to true
    tradeAccepted: {
        type: Boolean,
        default: false
    }
})


const Book = mongoose.model('Book', BookSchema);
module.exports = Book;