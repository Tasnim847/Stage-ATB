package org.example.stage_atb.Controller;


import org.example.stage_atb.Service.IUserService;
import org.example.stage_atb.dto.request.RegisterRequest;
import org.example.stage_atb.dto.response.UserResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable String id) {
        UserResponseDTO response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@PathVariable String email) {
        UserResponseDTO response = userService.getUserByEmail(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> response = userService.getAllUsers();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getUsersByRole(@PathVariable String role) {
        List<UserResponseDTO> response = userService.getUsersByRole(role);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable String id,
            @Valid @RequestBody RegisterRequest registerRequest) {
        UserResponseDTO response = userService.updateUser(id, registerRequest);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateUser(@PathVariable String id) {
        userService.activateUser(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable String id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/lock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> lockUser(@PathVariable String id) {
        userService.lockUser(id);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/unlock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> unlockUser(@PathVariable String id) {
        userService.unlockUser(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser() {
        UserResponseDTO response = userService.getUserById(
                userService.getCurrentUser().getId()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> countActiveUsers() {
        long count = userService.countActiveUsers();
        return ResponseEntity.ok(count);
    }
}