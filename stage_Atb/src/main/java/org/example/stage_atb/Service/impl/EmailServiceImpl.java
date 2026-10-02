package org.example.stage_atb.Service.impl;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IEmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements IEmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:4200}")
    private String frontendUrl;

    @Override
    public void sendPasswordResetEmail(String to, String firstName, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject("ATB Credit Intelligence - Réinitialisation de mot de passe");

            String resetLink = frontendUrl + "/auth?token=" + resetToken;

            String htmlContent = buildEmailHtml(firstName, resetToken, resetLink);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Email de réinitialisation envoyé à: {}", to);

        } catch (MessagingException e) {
            log.error("❌ Erreur envoi email à {} : {}", to, e.getMessage());
            throw new RuntimeException("Impossible d'envoyer l'email de réinitialisation", e);
        }
    }

    private String buildEmailHtml(String firstName, String resetToken, String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #1a237e, #3949ab); color: #fff; padding: 32px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; }
                    .content { padding: 32px; color: #333; line-height: 1.6; }
                    .content h2 { color: #1a237e; }
                    .token-box { background: #f5f7fa; border: 2px dashed #1a237e; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0; }
                    .token-box code { font-size: 18px; font-weight: bold; color: #1a237e; word-break: break-all; }
                    .btn { display: inline-block; background: #1a237e; color: #fff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px; }
                    .footer { background: #f5f5f5; padding: 16px; text-align: center; color: #888; font-size: 12px; }
                    .warning { color: #d32f2f; font-size: 13px; margin-top: 16px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>ATB Credit Intelligence</h1>
                    </div>
                    <div class="content">
                        <h2>Bonjour %s,</h2>
                        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                        <p>Voici votre token de réinitialisation :</p>

                        <div class="token-box">
                            <code>%s</code>
                        </div>

                        <p>Ou cliquez directement sur le bouton ci-dessous :</p>
                        <p style="text-align: center;">
                            <a href="%s" class="btn">Réinitialiser mon mot de passe</a>
                        </p>

                        <p class="warning">
                            ⚠️ Ce token est valable pendant <strong>1 heure</strong>.
                            Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                        </p>
                    </div>
                    <div class="footer">
                        © 2026 ATB Credit Intelligence. Tous droits réservés.
                    </div>
                </div>
            </body>
            </html>
            """.formatted(firstName, resetToken, resetLink);
    }
}