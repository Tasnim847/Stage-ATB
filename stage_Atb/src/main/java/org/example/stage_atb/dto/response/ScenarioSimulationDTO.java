package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioSimulationDTO {
    private String id;
    private String name;
    private String description;
    private List<ScenarioParameterDTO> parameters;
    private Double expectedOutcome;
    private Double probability;
    private String riskLevel;
}