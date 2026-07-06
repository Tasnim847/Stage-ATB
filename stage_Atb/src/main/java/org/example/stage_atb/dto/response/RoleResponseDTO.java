package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.UserRole;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponseDTO {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
    private List<String> permissions;
    private boolean active;
    private boolean locked;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private String employeeNumber;
    private String department;
    private String position;
}