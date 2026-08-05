package org.example.stage_atb.dto.response;


import lombok.Data;

@Data
public class FraudRuleResponse {
    private String id;
    private String name;
    private String description;
    private Integer weight;
    private Boolean isActive;
    private Integer threshold;
}