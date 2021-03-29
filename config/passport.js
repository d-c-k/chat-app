const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const User = require('../models/User')
const errorMessage = 'Incorrect username or password'

module.exports = function(passport){
    passport.use(new LocalStrategy(
        function(username, password, done){
            User.findOne({username: username}, (error, user) => {
                if(error){
                    return done(error)
                }
                if(!user){
                    return done(null, false, {message: errorMessage})
                }

                bcrypt.compare(password, user.password, (error, isMatch) => {
                    if(error){
                        throw error
                    }
                    if(isMatch){
                        return done(null, user)
                    } else {
                        return done(null, false, {message: errorMessage})
                    }
                })
            })
            .catch(error => console.log(error))
        }
    ))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (error, user) => {
            done(error, user)
        })
    })
}