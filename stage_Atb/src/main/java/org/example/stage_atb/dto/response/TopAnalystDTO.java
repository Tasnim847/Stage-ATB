package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopAnalystDTO {
    private String analystId;
    private String name;
    private String email;
    private Long requests;       // Nombre de dossiers traités
    private Double avgScore;     // Score moyen (0-100)
    private Long approvedCount;
    private Long rejectedCount;
}