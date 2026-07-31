package org.example.stage_atb.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrConfigResponse {
    private Long id;
    private String provider;
    private String endpoint;
    private List<String> languages;
    private Integer minConfidence;
    private Boolean enabled;
    private Integer maxRetries;
    private Integer timeout;
    private Boolean autoSync;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


