const { request, response } = require('express');
const { verifyGoogleToken } = require('../helpers/google.helper');

const validateGoogleToken = async(req=request, res=response, next)=>{
    const token = req.header('x-token');
    if(!token){
        return res.redirect('/')
    }   
    try{
        const {payload} = await verifyGoogleToken(token);

        const {email, name, picture} = payload;

        if(!req.session.user){
            req.session.user = {name, email, picture, token};
        }
        next();
    }
    catch(err){
        console.log(err);
        return res.redirect('/')
    }
}


module.exports = {
    validateGoogleToken
}