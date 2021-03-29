module.exports = {
    ensureAuthenticated: (req, res, next) =>{
        if(req.isAuthenticated()){
            return next()
        } else {
            req.flash('error_msg', 'Log in to proceed')
            res.redirect('/users/login')
        }
    }
}