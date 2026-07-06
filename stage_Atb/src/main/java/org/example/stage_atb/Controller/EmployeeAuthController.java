package org.example.stage_atb.Controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IEmployeeService;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.EmployeeRegisterRequest;
import org.example.stage_atb.dto.response.AuthResponse;
import org.example.stage_atb.dto.response.ErrorResponse;
import org.example.stage_atb.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/employee")
@RequiredArgsConstructor
@Slf4j
public class EmployeeAuthController {

    private final IUserService userService;
    private final IEmployeeService employeeService;

    @PostMapping("/register")
    public ResponseEntity<?> registerEmployee(@Valid @RequestBody EmployeeRegisterRequest request) {
        log.info("Tentative d'inscription employé: {} - Numéro: {}",
                request.getEmail(), request.getEmployeeNumber());
        try {
            // ✅ Vérifier que le numéro d'employé n'existe pas déjà
            // Cette vérification est faite dans createEmployeeFromUser

            // 1. Créer l'utilisateur avec le rôle correspondant
            AuthResponse authResponse = userService.registerEmployee(request);

            // 2. Récupérer l'utilisateur créé
            User user = userService.getUserEntityById(authResponse.getId());

            // 3. Créer l'employé lié à l'utilisateur
            employeeService.createEmployeeFromUser(user, request);

            log.info("Inscription employé réussie: {} - Numéro: {}",
                    request.getEmail(), request.getEmployeeNumber());
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
        } catch (RuntimeException e) {
            log.error("Erreur lors de l'inscription employé: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("REGISTRATION_ERROR", e.getMessage()));
        }
    }
}