package org.example.stage_atb.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrExtractionResultResponse {
    private Boolean success;
    private String documentType;
    private Map<String, Object> extractedFields;
    private Integer confidence;
    private List<String> warnings;
    private List<String> errors;
    private String rawText;
    private Long processingTimeMs;
}

