import mongoose,{Schema} from 'mongoose' //extracting schema from mongoose
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema=new Schema(
    {
      videoFile:{
        type:String, //cloudinary url
        required:true
      },

      thumbnail:{
        type:String, //cloudinary url
        required:true
      },

      title:{
        type:String, 
        required:true
      },

      description:{
        type:String,
        required:true
      },

      duration:{
        type:Number,
        required:true
      },

      views:{
        type:Number,
        default:0
      },

      isPublished:{
        type:Boolean,
        default:true,  
      },

      owner:{
        type:Schema.Types.ObjectId, //schema ek type dena jo objectId ho
        ref:"User"
      }
    },
    {
        timestamps:true
    }
)
videoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",videoSchema);