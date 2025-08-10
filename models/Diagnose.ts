// import mongoose from "mongoose";

// const diagnoseSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: [true, "Please provide a title"]
//     },
//     jsonData: {
//         type: Object,
//         default: null
//     },
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// // Create index for faster queries
// diagnoseSchema.index({ user: 1 });

// const Diagnose = mongoose.models.Diagnose || mongoose.model("Diagnose", diagnoseSchema);
// export default Diagnose;