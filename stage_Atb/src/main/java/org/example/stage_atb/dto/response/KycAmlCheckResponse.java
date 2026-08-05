package org.example.stage_atb.dto.response;

import lombok.Data;

@Data
public class KycAmlCheckResponse {
    private String id;
    private String name;
    private String type;
    private Boolean isActive;
    private Integer weight;
}