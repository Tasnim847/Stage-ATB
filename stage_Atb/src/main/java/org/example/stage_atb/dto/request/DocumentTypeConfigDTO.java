package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.DocumentType;

import jakarta.validation.constraints.NotBlank;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTypeConfigDTO {
    @NotBlank(message = "Document type name is required")
    private String name;

    private String description;
    private boolean mandatory;
    private boolean requiresVerification;
    private Integer maxSizeMB;
    private String[] allowedFormats;
}