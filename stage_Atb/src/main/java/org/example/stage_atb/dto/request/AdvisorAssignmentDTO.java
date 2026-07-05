package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvisorAssignmentDTO {
    private String advisorId;
    private List<String> clientIds;
    private String action; // "ASSIGN", "REASSIGN", "REMOVE"
}