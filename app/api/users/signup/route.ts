
// import { connect } from '@/dbConfig/dbConfig'
// import User from '@/models/userModel'
// import { NextRequest, NextResponse } from 'next/server'
// import bcryptjs from 'bcryptjs'
// // import { Save } from 'lucide-react'
// import { sendEmail } from '@/helpers/mailer'
// connect()

// export async function POST(request: NextRequest) {

//     try {
//         const reqBody =await request.json()
//         const { username, email,  password} = reqBody
//         //validation
//         console.log(reqBody)
//         const user = await User.findOne({ email })
//         if (user) {
//             return NextResponse.json({ error: "User already exists" }, { status: 400 })
//         }
//         const salt=await bcryptjs.genSalt(10)
//         const hashedPassword=await bcryptjs.hash(password,salt)

//         const newUser=new User({
//             username,
//             email,
//             password:hashedPassword
//         })
//         const savedUser=await newUser.save()
//         console.log(savedUser)
//         //send verification mail
//         await sendEmail({email,emailType:"VERIFY",userId:savedUser._id})

//         return NextResponse.json({
//             message:"User registered successfully",
//             success:true,
//             savedUser,
//         })

//     } catch (error: any) {
//         return NextResponse.json({ error: error.message }, { status: 500 })
//     }

// }
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";

export async function POST(request: NextRequest) {
    console.log("📩 POST /api/users/signup");

    await connect(); // ✅ Ensures DB is connected before queries

    try {
        const reqBody = await request.json();
        console.log("Request body:", reqBody);

        const { username, email, password } = reqBody;

        const user = await User.findOne({ email });
        if (user) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = new User({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();

        console.log("✅ User saved:", savedUser);

        await sendEmail({ email, emailType: "VERIFY", userId: savedUser._id });

        return NextResponse.json({
            message: "User registered successfully",
            success: true,
            savedUser,
        });
    } catch (error: any) {
        console.error("Signup error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
