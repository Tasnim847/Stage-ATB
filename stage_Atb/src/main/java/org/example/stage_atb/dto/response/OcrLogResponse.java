package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrLogResponse {
    private Long id;
    private String documentType;
    private Long documentId;
    private String result;
    private Integer confidence;
    private String message;
    private Object extractedData;  // Peut être Map ou autre
    private Integer duration;
    private String userEmail;
    private LocalDateTime createdAt;
}