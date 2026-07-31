package org.example.stage_atb.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrFieldResponse {
    private Long id;
    private String name;
    private String type;
    private Boolean required;
    private String regex;
    private String description;
}

