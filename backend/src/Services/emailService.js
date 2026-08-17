import brevo from "@getbrevo/brevo";

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

export async function sendOTPEmail(email, code) {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = "Your Recipia Verification Code";

    sendSmtpEmail.htmlContent = `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem; background:#fefce8; border-radius:12px;">
        <h2 style="color:#c0392b; text-align:center;">Recipia</h2>

        <p style="text-align:center; color:#374151;">
          Your verification code is:
        </p>

        <div style="text-align:center; font-size:2.4rem; font-weight:800; letter-spacing:0.3rem; color:#c0392b; margin:1rem 0;">
          ${code}
        </div>

        <p style="text-align:center; color:#6b7280; font-size:0.85rem;">
          This code expires in 10 minutes.
        </p>
      </div>
    `;

    sendSmtpEmail.sender = {
      name: "Recipia",
      email: "osinoikitobi@gmail.com"
    };

    sendSmtpEmail.to = [
      {
        email: email
      }
    ];

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`OTP email sent to ${email}`, result);
  } catch (error) {
    console.error("Brevo email error:", error);
    throw error;
  }
}