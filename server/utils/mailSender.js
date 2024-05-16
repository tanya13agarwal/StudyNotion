const nodemailer = require("nodemailer");

const mailSender = async(email,title,body) => {
    try{
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })

        console.log("host: ",transporter.host);
        console.log("user: ",transporter.user);
        console.log("pass: ",transporter.pass);

        console.log("email: ",email);
        console.log("title: ",title);
        console.log("body: ",body);

        let info = await transporter.sendMail({
            from: ' StudyNotion || Tanya Agarwal ',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        }) 
        
        console.log("info", info);
        return info; 
    }
    catch(err){
        // console.log("yha p error h");
        console.log(err.message);
    }
}

module.exports = mailSender;