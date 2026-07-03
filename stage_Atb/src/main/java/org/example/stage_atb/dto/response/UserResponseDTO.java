package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.UserRole;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private String phoneNumber;
    private boolean active;
    private boolean locked;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private Long totalCreditRequests;
    private Long totalNotifications;
}