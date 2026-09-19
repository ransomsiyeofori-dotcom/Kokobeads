const nodemailer = require("nodemailer");

const sendContactMessage = async (req, res) => {
    try {
        const {
            name,
            email,
            subject,
            message
        } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: "Please complete all required fields."
            });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.CONTACT_EMAIL,
                pass: process.env.CONTACT_EMAIL_PASSWORD
            }
        });

        await transporter.sendMail({
            from: `"Kokobeads Website" <${process.env.CONTACT_EMAIL}>`,
            to: process.env.CONTACT_EMAIL,
            replyTo: email,
            subject: `Kokobeads Contact: ${subject}`,
            text: [
                `Name: ${name}`,
                `Email: ${email}`,
                `Subject: ${subject}`,
                "",
                "Message:",
                message
            ].join("\n")
        });

        return res.status(200).json({
            message: "Your message has been sent successfully."
        });

    } catch (error) {

        console.error(
            "Contact email failed:",
            error.message
        );

        return res.status(500).json({
            message: "Unable to send your message right now. Please try again later."
        });
    }
};

module.exports = {
    sendContactMessage
};
