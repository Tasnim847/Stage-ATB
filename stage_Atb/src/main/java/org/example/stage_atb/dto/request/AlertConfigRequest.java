package org.example.stage_atb.dto.request;


import lombok.Data;
import jakarta.validation.constraints.NotBlank;  // ✅ CHANGÉ
import jakarta.validation.constraints.NotNull;  // ✅ CHANGÉ
import java.util.List;

@Data
public class AlertConfigRequest {

    @NotBlank(message = "L'événement est obligatoire")
    private String event;

    private String description;

    @NotNull(message = "Les destinataires sont obligatoires")
    private List<String> recipients;

    private Boolean isActive = true;

    @NotBlank(message = "La priorité est obligatoire")
    private String priority;

    @NotNull(message = "Les méthodes de notification sont obligatoires")
    private List<String> notificationMethods;
}