const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    
    email: {
        type: String,
        required: true,
    },

    otp: {
        type: String,
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now(),
        // the document will be automatically deleted after 5 minutes of its creation time
        expires: 5*60,
    }
});

// a function to send mails
async function sendVerificationMail(email, otp){
    try{
        // create a transporter to send emails
        // define email options
        // send the email
        const mailResponse = await mailSender(email, "Verification Email from StudyNotion", emailTemplate(otp));
        console.log("email sent successfully: ", mailResponse.response);
    }
    catch(error){
        console.log("error occured while sending mails: ", error);
        throw error;
    }
}
 
// Define a pre-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
	console.log("New document saved to database");

	// Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationMail(this.email, this.otp);
	}

    // ye upr vala step krne k baad aap next middleware pe chale jayege
	next();
});

const OTP = mongoose.model("OTP", OTPSchema);
module.exports = OTP;
