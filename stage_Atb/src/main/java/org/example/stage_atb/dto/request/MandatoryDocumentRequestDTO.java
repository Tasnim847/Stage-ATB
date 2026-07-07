package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.NotNull;
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
public class MandatoryDocumentRequestDTO {
    @NotBlank(message = "Client ID is required")
    private String clientId;

    @NotNull(message = "Document type is required")
    private DocumentType documentType;

    private String reason;
}

