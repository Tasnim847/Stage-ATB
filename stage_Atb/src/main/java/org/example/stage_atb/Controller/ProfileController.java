// controller/ProfileController.java
package org.example.stage_atb.Controller;

import lombok.RequiredArgsConstructor;
import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.PasswordUpdateRequest;
import org.example.stage_atb.dto.request.ProfileUpdateRequest;
import org.example.stage_atb.dto.response.ProfileResponseDTO;
import org.example.stage_atb.entity.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final IUserService userService;

    @GetMapping
    public ResponseEntity<ProfileResponseDTO> getProfile(Authentication authentication) {
        // Récupérer l'utilisateur connecté
        User user = userService.getCurrentUser();
        String userId = user.getId();
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PutMapping
    public ResponseEntity<ProfileResponseDTO> updateProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request) {
        User user = userService.getCurrentUser();
        String userId = user.getId();
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }

    @PutMapping("/password")
    public ResponseEntity<Void> updatePassword(
            Authentication authentication,
            @RequestBody PasswordUpdateRequest request) {
        User user = userService.getCurrentUser();
        String userId = user.getId();
        userService.updatePassword(userId, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}