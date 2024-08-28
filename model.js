let mongoose =require("mongoose");
let Schema= mongoose.Schema;
let userSchema =new Schema ({
    googleId: {
        type: String,
        required: true,
        unique: true
      },
      displayName: {
        type: String,
        required: true
      },
      
      
      profilePicture: {
        type: String
      },
      
});


module.exports=mongoose.model('User',userSchema);