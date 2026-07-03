package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.EmployeeStatus;
import org.example.stage_atb.enums.UserRole;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponseDTO {

    private String id;
    private String employeeNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String address;
    private String city;
    private String country;
    private String postalCode;
    private UserRole role;
    private EmployeeStatus status;
    private String department;
    private String position;
    private LocalDate hireDate;
    private String managerId;
    private String managerName;
    private String notes;
    private boolean active;
    private LocalDateTime createdAt;
    private String userId;
}