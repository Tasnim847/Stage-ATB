package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.EmployeeStatus;
import org.example.stage_atb.enums.UserRole;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequestDTO {

    @NotBlank(message = "Le prénom est requis")
    private String firstName;

    @NotBlank(message = "Le nom est requis")
    private String lastName;

    @NotBlank(message = "L'email est requis")
    @Email(message = "L'email doit être valide")
    private String email;

    private String phoneNumber;

    private String address;

    private String city;

    private String country;

    private String postalCode;

    @NotNull(message = "Le rôle est requis")
    private UserRole role;

    private EmployeeStatus status;

    private String department;

    private String position;

    private LocalDate hireDate;

    private String managerId;

    private String notes;
}