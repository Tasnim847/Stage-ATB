package org.example.stage_atb.Service;

public interface IEmailService {

    /**
     * Envoyer un email de réinitialisation de mot de passe
     */
    void sendPasswordResetEmail(String to, String firstName, String resetToken);
}