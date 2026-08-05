package org.example.stage_atb.dto.request;


import lombok.Data;
import jakarta.validation.constraints.NotBlank;  // ✅ CHANGÉ
import jakarta.validation.constraints.NotNull;  // ✅ CHANGÉ
import java.util.List;

@Data
public class KycAmlConfigRequest {

    @NotBlank(message = "La catégorie est obligatoire")
    private String category;

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String description;

    private Boolean isActive = true;

    private Boolean required = false;

    @NotNull(message = "La priorité est obligatoire")
    private Integer priority;

    private Boolean autoCheck = false;

    private List<KycAmlCheckRequest> checks;
}

