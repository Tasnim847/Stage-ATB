package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrFieldRequest {

    @NotBlank(message = "Le nom du champ est requis")
    private String name;

    @NotBlank(message = "Le type du champ est requis")
    private String type;

    private Boolean required = false;

    private String regex;

    private String description;
}


