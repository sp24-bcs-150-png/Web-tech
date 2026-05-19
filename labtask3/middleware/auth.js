module.exports = {
    isLoggedIn: (req, res, next) => {
        if (req.session.user) {
            return next();
        }
        req.flash('error', 'Please log in to access this page.');
        res.redirect('/login');
    },

    isAdmin: (req, res, next) => {
        if (req.session.user && req.session.user.role === 'admin') {
            return next();
        }
        req.flash('error', 'Access Denied: Admins Only! 🚨');
        res.redirect('/');
    }
};