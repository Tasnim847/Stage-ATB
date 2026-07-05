// dto/response/ProfileResponseDTO.java
package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.UserRole;

import java.time.LocalDate;  // ← Importer LocalDate au lieu de LocalDateTime
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponseDTO {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private String city;
    private String country;
    private String postalCode;
    private String profilePicture;
    private UserRole role;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private String employeeNumber;
    private String department;
    private String position;
    private String clientNumber;
    private LocalDate dateOfBirth;  // ← Changé de LocalDateTime à LocalDate
}