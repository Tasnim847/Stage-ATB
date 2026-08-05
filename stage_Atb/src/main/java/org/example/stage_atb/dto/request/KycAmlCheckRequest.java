package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.NotBlank;  // ✅ CHANGÉ
import jakarta.validation.constraints.NotNull;  // ✅ CHANGÉimport lombok.Data;
import lombok.Data;

@Data
public class KycAmlCheckRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String type;

    private Boolean isActive = true;

    @NotNull(message = "Le poids est obligatoire")
    private Integer weight;
}
