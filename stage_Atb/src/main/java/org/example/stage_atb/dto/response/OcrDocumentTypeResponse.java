package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrDocumentTypeResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private Boolean ocrEnabled;
    private Boolean required;
    private Integer maxSize;
    private List<String> allowedFormats;
    private List<OcrFieldResponse> fields;
    private List<ValidationRuleResponse> validationRules;
    private Integer fieldCount;
    private Integer ruleCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
