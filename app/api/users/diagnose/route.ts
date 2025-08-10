// import { connect } from "@/dbConfig/dbConfig";
// import Diagnose from "@/models/Diagnose";
// import User from "@/models/userModel";
// import { getDataFromToken } from "@/helpers/getDatafromToken";
// import { NextRequest, NextResponse } from "next/server";

// // Connect to DB
// await connect();

// export async function POST(request: NextRequest) {
//     try {
//         const userId = await getDataFromToken(request);
//         if (!userId) {
//             return NextResponse.json(
//                 { error: "Unauthorized" },
//                 { status: 401 }
//             );
//         }

//         const { title, jsonData } = await request.json();

//         const newDiagnose = new Diagnose({
//             title,
//             jsonData,
//             user: userId
//         });

//         const savedDiagnose = await newDiagnose.save();

//         // Update user's diagnoses array
//         await User.findByIdAndUpdate(userId, {
//             $push: { diagnoses: savedDiagnose._id }
//         });

//         return NextResponse.json({
//             success: true,
//             diagnose: savedDiagnose
//         });

//     } catch (error: any) {
//         return NextResponse.json(
//             { error: error.message || "Server error" },
//             { status: 500 }
//         );
//     }
// }

// export async function GET(request: NextRequest) {
//     try {
//         const userId = await getDataFromToken(request);
//         if (!userId) {
//             return NextResponse.json(
//                 { error: "Unauthorized" },
//                 { status: 401 }
//             );
//         }

//         const diagnoses = await Diagnose.find({ user: userId })
//             .sort({ createdAt: -1 });

//         return NextResponse.json({
//             success: true,
//             diagnoses
//         });

//     } catch (error: any) {
//         return NextResponse.json(
//             { error: error.message || "Server error" },
//             { status: 500 }
//         );
//     }
// }