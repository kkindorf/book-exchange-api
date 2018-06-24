const User = require('../models/user');
const Book = require('../models/book');

    exports.index = function(req, res, next) {
        Book.find({})
            .then((books) => {
                if(books.length) {
                    res.send({data: books});
                }
                else {
                    res.send({data: 'No Books Saved Yet'});
                }
            })
    },
    exports.saveBook = function(req, res, next) {
        let userId = req.body.userId;
        let savedBookData = req.body.bookData;
        
        User.findOne({_id: userId})
            .then((user) => {
                
                var newBook = new Book ({
                    owner: userId,
                    title: savedBookData.title,
                    image: savedBookData.image,
                    authors: savedBookData.authors,
                    previewLink: savedBookData.previewLink
                })
                newBook.save()
                    .then((book) => {
                        res.send({data: book})
                        user.ownedBooks.push(book._id);
                        user.save();
                    })
                    .catch((e) => {
                        res.status(400).json({
                            error: "Book could not be saved"
                        });
                    })
            })
        
    }

    
    exports.makeBookRequest = function(req, res, next) {
        //when user makes request borrow book, notify owner and toggle book lentOut to true
        //also notify requestor by adding to their requests
       let requestorId = req.body.userId;
       let bookId = req.body.bookId;
        Book.findOne({_id: bookId})
            .then((book) => {
                //check if owner is requesting own book
                if(requestorId === book.owner.toString()) {
                    //check if tradeRequested is still false in front end
                    res.send({data: book});
                    return;
                }
                    User.findOne({_id: requestorId})
                        .then((requestor) => {
                            console.log(requestor)
                            if(!requestor.state ) {
                                book.badRequest =  "you must update your address before requesting a book. Please go to your bookshelf and update your address.";
                                res.send({data: book});
                                return;
                            }
                            else {
                                requestor.myTradeRequests.push(book);
                                requestor.save();
                                User.findOne({_id: book.owner.toString()})
                                .then((owner) => {
                                    owner.tradeRequestsFromOther.push({book: book, requestorId})
                                    owner.save();
                                })
                                book.tradeRequested = true;
                                book.save();
                                res.send({data: book});
                            }
                            
                        })
            })

    }
    
    exports.getUserProfileData = function(req, res, next) {
        let userId = req.params.id;
        User.findOne({_id: userId})
            .populate('ownedBooks')
            .populate('myTradeRequests')
            .populate('tradeRequestsFromOther.book')
            .populate('tradeRequestsFromOther.requestorId')
            .then((books) => {
                res.send({data: books});
            })
    }

    exports.approveRequest = function(req, res, next) {
        let bookId = req.body.bookId;
        let ownerId = req.body.userId;
        Book.findOne({_id: bookId})
            .then((book) => {
                book.tradeAccepted = true;
                book.save();
                res.send({data: book})
            })
    }
    
    exports.updateProfile = function(req, res, next) {
        let userId = req.body.userId;
        let address = req.body.stateAndAddress.address;
        let state = req.body.stateAndAddress.state;
        User.findOne({_id: userId})
            .then((user) => {
                user.state = state;
                user.address = address;
                user.save();
                res.send({data: user});
            })
       
    }

    exports.getUserAddress = function(req, res, next) {
        let userId = req.params.id;
        User.findOne({_id: userId})
            .then((user) => {
                res.send({data: user});
            })
    }

    exports.returnBook = function(req, res, next) {
        let bookId = req.body.bookId;
        let userId = req.body.userId;
        //remove book from requestor's list of requests
        User.findOne({_id: userId})
            .then((user) => {
                let index = user.myTradeRequests.indexOf(bookId);
                user.myTradeRequests.splice(index, 1);
                user.save();

            })
        Book.findOne({_id: bookId})
            .then((book) => {
                book.tradeAccepted = false;
                book.tradeRequested = false;
                book.save();

                let ownerId = book.owner.toString();
                //delete owner's trade request from other
                User.findOne({_id: ownerId})
                    .populate('ownedBooks')
                    .populate('myTradeRequests')
                    .populate('tradeRequestsFromOther.book')
                    .populate('tradeRequestsFromOther.requestorId')
                    .then((owner) => {
                        let requestIndex;
                       owner.tradeRequestsFromOther.forEach(function(request, i) {
                           if(request.book._id.toString() === bookId) {
                                requestIndex = i;
                           }
                       })
                       owner.tradeRequestsFromOther.splice(requestIndex, 1);
                       owner.save();
                       res.send({returnedBook: book, updatedUser: owner})
                    })
                    

                
            })
    }
