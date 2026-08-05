package org.example.stage_atb.dto.response;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RiskModelResponse {
    private String id;
    private String type;
    private String name;
    private String description;
    private Boolean isActive;
    private Integer priority;
    private Object configuration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}