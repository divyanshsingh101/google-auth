let express=require('express');
let app=express();
let session=require("express-session");
let cookieparser=require("cookie-parser"); 
let User=require('./model.js');
let passport =require("passport");
require('dotenv').config();
let path=require('path');
let GoogleStrategy=require('passport-google-oauth20').Strategy;
let mongoDB_url="mongodb://localhost:27017/Auth";
let mongoose=require('mongoose');
async function main(){
    await mongoose.connect(mongoDB_url);
};

main() 
.then(()=>{console.log("database connected ")})
.catch((err)=>console.log(err));

let port=3000;
app.use(session({
    secret: 'john snow ',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
 app.use(passport.initialize());
 app.use(passport.session());
 app.set("view engine","ejs"); 
app.set("views",path.join(__dirname,"views"));
passport.serializeUser(function(user, done) {
   // console.log('Serializing user:', user); // Add a log here
    done(null, user.id); // Store the user ID in the session
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        //console.log('Deserializing user:', user); // Add a log here
        done(null, user); // Retrieve the user from the database
    } catch (err) {
        done(err, null);
    }
});
 passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/users/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try{
        console.log("heloo");
    let {id,displayName , photos}=profile;
    let curUser=await User.findOne({googleId:id});
    console.log(curUser);
    if(curUser){
        console.log("helloo !");
        console.log(displayName);
        return done(null,curUser);
    }
    else {
        console.log("user n found")
        let newUser =new User({
            googleId:id,
            displayName:displayName,
            profilePicture:photos[0].value,
        });
        await newUser.save();
        console.log("user saved");
        return done(null,newUser);
    }
    
  
}catch (err){
   return done(err,false);
}
}));
app.get('/auth/google', passport.authenticate('google', { scope: ['profile'] }));
app.get('/users/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
        function(req, res) {
          res.redirect('/success');
        });
app.listen(port,()=>{
    console.log("app is listening");


})



app.get('/',(req,res)=>{
    console.log("/ triggered");
    res.render("login.ejs");
    
})

app.use('/users/auth/google/callback',(req,res)=>{
    res.redirect("/success");
})

app.use('/success',(req,res)=>{
    // console.log(req.curUser);
    // console.log(req.newUser);
    // console.log(req.user);
    let{displayName,profilePicture}=req.user;
    res.render('postLogin',{displayName ,profilePicture});
})

