// dto/request/AuditLogFilterRequest.java - CORRIGÉ
package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogFilterRequest {
    private String userId;
    private String username;
    private String actionType; // ✅ Changé de ActionType à String
    private String status;
    private String module;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String searchTerm;
    private int page = 0;
    private int size = 50;
    private String sortBy = "timestamp";
    private String sortDirection = "DESC";
}