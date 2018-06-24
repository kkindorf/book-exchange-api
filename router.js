const Authentication = require('./controllers/authentication');
const AppActions = require('./controllers/app-actions');
const passportService = require('./services/passport');
const passport = require('passport');

const requireAuth = passport.authenticate('jwt', {session: false});
const requireSignIn = passport.authenticate('local', {session: false });

module.exports = function(app) {
    app.get('/all-books', AppActions.index);
    app.post('/save-book', requireAuth, AppActions.saveBook);
    app.post('/make-request', requireAuth, AppActions.makeBookRequest)
    app.post('/signin', requireSignIn, Authentication.signin);
    app.post('/signup', Authentication.signup);
    app.get('/user/:id',  requireAuth, AppActions.getUserProfileData);
    app.post('/approve-request', requireAuth, AppActions.approveRequest);
    app.post('/update-profile', requireAuth, AppActions.updateProfile);
    app.get('/get-address/:id', requireAuth, AppActions.getUserAddress);
    app.post('/return-book', requireAuth, AppActions.returnBook);
}