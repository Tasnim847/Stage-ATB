package org.example.stage_atb.dto.response;


import lombok.Data;

@Data
public class FinancialRatioResponse {
    private String id;
    private String name;
    private String description;
    private String key;
    private Double minValue;
    private Double maxValue;
    private Double criticalMin;
    private Double criticalMax;
    private String unit;
    private Boolean isActive;
    private Integer priority;
}
