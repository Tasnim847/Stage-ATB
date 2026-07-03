package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.DocumentType;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponseDTO {

    private String id;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private DocumentType documentType;
    private String description;
    private String clientId;
    private String clientName;
    private String creditRequestId;
    private String uploadedBy;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
    private Boolean verified;
    private Boolean complete;
    private String ocrResult;
    private String extractedData;
}