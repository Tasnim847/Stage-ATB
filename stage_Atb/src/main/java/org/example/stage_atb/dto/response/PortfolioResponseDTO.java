package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioResponseDTO {
    private int totalCredits;
    private List<Map<String, Object>> credits;
    private List<String> creditTypes;
    private Map<String, Object> statistics;
}