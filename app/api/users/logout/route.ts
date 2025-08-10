import { connect } from '@/dbConfig/dbConfig'
import User from '@/models/userModel'
import { NextRequest, NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'
// import { Save } from 'lucide-react'
import { sendEmail } from '@/helpers/mailer'
import next from 'next'
import { error } from 'console'
import jwt from 'jsonwebtoken'
connect()

export async function GET(request:NextRequest){
    try{
        const response=NextResponse.json({
            message:"Logout successfully",
            success:true
        })
        response.cookies.set("token","",{
            httpOnly:true,
            expires:new Date(0)
        })
        return response

    }catch(error:any){
        return NextResponse.json({error:error.message},{status:500})
    }
}