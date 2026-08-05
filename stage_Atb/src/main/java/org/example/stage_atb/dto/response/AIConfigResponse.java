package org.example.stage_atb.dto.response;


import lombok.Data;

@Data
public class AIConfigResponse {
    private String id;
    private String provider;
    private String model;
    private Double temperature;
    private String systemPrompt;
    private String language;
    private Integer minScore;
    private Boolean explanationRequired;
    private Boolean isActive;
}