package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationRuleResponse {
    private Long id;
    private String name;
    private String condition;
    private String value;
    private String value2;
    private String action;
    private String message;
    private Boolean active;
}

