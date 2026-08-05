package org.example.stage_atb.dto.response;


import lombok.Data;

@Data
public class RiskThresholdResponse {
    private String id;
    private Integer minScore;
    private Integer maxScore;
    private String level;
    private String label;
    private String color;
    private String alertLevel;
    private Boolean isActive;
}
