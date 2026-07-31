package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrLogRequest {
    private String documentType;
    private Long documentId;
    private String result;
    private Integer confidence;
    private String message;
    private Object extractedData;  // Accepte n'importe quel type
    private Integer duration;
    private String userEmail;
}