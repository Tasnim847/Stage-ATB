package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientResponseDTO {

    private String id;
    private String clientNumber;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String nationality;
    private String profession;
    private String employer;
    private String monthlyIncome;
    private String address;
    private String city;
    private String country;
    private String advisorName;
    private String advisorId;
    private String analystName;
    private String analystId;
    private Boolean active;
    private LocalDateTime createdAt;
    private Integer totalCreditRequests;
    private Double averageCreditScore;
    private String riskCategory;
    private Double overallScore;
}