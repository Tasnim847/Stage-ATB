package org.example.stage_atb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IClientService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.ClientRegisterRequest;
import org.example.stage_atb.dto.response.AuthResponse;
import org.example.stage_atb.dto.response.ClientResponseDTO;
import org.example.stage_atb.dto.response.ErrorResponse;
import org.example.stage_atb.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/client")
@RequiredArgsConstructor
@Slf4j
public class ClientAuthController {

    private final IUserService userService;
    private final IClientService clientService;

    @PostMapping("/register")
    public ResponseEntity<?> registerClient(@Valid @RequestBody ClientRegisterRequest request) {
        log.info("Tentative d'inscription client: {}", request.getEmail());
        try {
            // 1. Créer l'utilisateur avec le rôle CLIENT
            AuthResponse authResponse = userService.registerClient(request);

            // 2. Récupérer l'utilisateur créé
            User user = userService.getUserEntityById(authResponse.getId());

            // 3. Créer le client lié à l'utilisateur
            ClientResponseDTO clientResponse = clientService.createClientFromUser(user, request);

            log.info("Inscription client réussie: {} avec client ID: {}",
                    request.getEmail(), clientResponse.getId());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(authResponse);
        } catch (RuntimeException e) {
            log.error("Erreur lors de l'inscription client: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("REGISTRATION_ERROR", e.getMessage()));
        }
    }
}