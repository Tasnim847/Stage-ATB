package org.example.stage_atb.dto.response;


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DecisionRuleResponse {
    private String id;
    private String name;
    private String description;
    private String condition;
    private String action;
    private Integer priority;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
