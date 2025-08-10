import nodemailer from 'nodemailer'
import bcryptjs from 'bcryptjs'
import User from '@/models/userModel'



export const sendEmail = async ({ email, emailType, userId }: any) => {

    //TODO:configure mail for usage


    try {
        const hashedToken = await bcryptjs.hash(userId.toString(), 10)

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId, { $set:{verifyToken: hashedToken, verifyTokenExpiry: Date.now() + 3600000} })
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId, { $set:{forgotPasswordToken: hashedToken, forgotPasswordTokenExpiry: Date.now() + 3600000} })
        }


        // Looking to send emails in production? Check out our Email API/SMTP product!
        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525, 
            auth: {
                user: "e8e7049e2baa73",
                pass: "f7934c7d6f0d1e"
            }
        });

        const mailOptions = {
            from: 'sandbox.smtp.mailtrap.io',
            to: email,
            subject: emailType === 'VERIFY' ? "Verify you email" : "Reset you password",
            html: `<p>Click <a href="${process.env.DOMAIN}/verifyemail?token=${hashedToken}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"} or copy and paste the 
            link in the browser<br>${process.env.DOMAIN}/verifyemail?token=${hashedToken}</p>`,
        }

        const mailReponse = await transport.sendMail(mailOptions)
        return mailReponse

    } catch (error: any) {
        throw new Error(error.message)
    }
}

