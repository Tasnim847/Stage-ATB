package org.example.stage_atb.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.DocumentType;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadRequestDTO {

    @NotBlank(message = "Client ID is required")
    private String clientId;

    private String creditRequestId;

    @NotNull(message = "Document type is required")
    private DocumentType documentType;

    private String description;

    @NotNull(message = "File is required")
    private MultipartFile file;
}