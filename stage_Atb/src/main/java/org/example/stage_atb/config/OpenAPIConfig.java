package org.example.stage_atb.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "ATB Credit Intelligence API",
                version = "1.0.0",
                description = "API pour la plateforme FinTech d'aide à la décision bancaire",
                contact = @Contact(
                        name = "ATB Credit Intelligence",
                        email = "support@atb-ci.com",
                        url = "https://www.atb.com.tn"
                ),
                license = @License(
                        name = "Apache 2.0",
                        url = "https://www.apache.org/licenses/LICENSE-2.0"
                )
        ),
        servers = {
                @Server(
                        description = "Serveur de développement",
                        url = "http://localhost:8081"
                ),
                @Server(
                        description = "Serveur de test",
                        url = "http://localhost:8083"
                ),
                @Server(
                        description = "Production Server",
                        url = "https://api.atb-ci.com"
                )
        },
        security = {
                @SecurityRequirement(name = "bearerAuth")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "JWT token pour l'authentification. Obtenez un token via /api/auth/login"
)
public class OpenAPIConfig {
}