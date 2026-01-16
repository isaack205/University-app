const FormData = require("form-data");
const Mailgun = require("mailgun.js");

async function sendSimpleMessage() {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.API_KEY || "7923ddbe7ba757e243bf40eac790ee79-42b8ce75-fe4ece9a",
    // If you have an EU domain, uncomment:
    // url: "https://api.eu.mailgun.net"
  });

  try {
    const data = await mg.messages.create("sandboxf71c448076e84f4fb5ec7b25e39a7f2d.mailgun.org", {
      from: "Mailgun Sandbox <postmaster@sandboxf71c448076e84f4fb5ec7b25e39a7f2d.mailgun.org>",
      to: ["Isaac Kahura <kahuraisaac30@gmail.com>"],
      subject: "Hello Isaac Kahura",
      text: "Congratulations Isaac Kahura, you just sent an email with Mailgun! You are truly awesome!",
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); // logs any error
  }
}

sendSimpleMessage(); // ✅ call the function
