package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientRegisterRequest {

    @NotBlank(message = "Le nom d'utilisateur est requis")
    @Size(min = 3, max = 50, message = "Le nom d'utilisateur doit contenir entre 3 et 50 caractères")
    private String username;

    @NotBlank(message = "L'email est requis")
    @Email(message = "L'email doit être valide")
    private String email;

    @NotBlank(message = "Le mot de passe est requis")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    @NotBlank(message = "Le prénom est requis")
    private String firstName;

    @NotBlank(message = "Le nom est requis")
    private String lastName;

    private String phoneNumber;

    @Past(message = "La date de naissance doit être dans le passé")
    private LocalDate dateOfBirth;

    private String address;

    private String city;

    private String country;

    // ✅ Champs supplémentaires pour le client
    private String placeOfBirth;
    private String nationality;
    private String maritalStatus;
    private String gender;
    private String identityNumber;
    private String identityType;
    private String profession;
    private String employer;
    private String monthlyIncome;
    private String postalCode;
    private String notes;
}