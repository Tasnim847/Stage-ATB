// Service/IAuditLogService.java - Version avec ActionType
package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.AuditLogFilterRequest;
import org.example.stage_atb.dto.response.AuditLogResponseDTO;
import org.example.stage_atb.enums.ActionType;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface IAuditLogService {
    void logAction(String userId, String username, String email, String action, String details,
                   String ipAddress, String userAgent, String module, ActionType actionType,
                   String status, String errorMessage);

    Page<AuditLogResponseDTO> getAuditLogs(AuditLogFilterRequest filterRequest);

    List<AuditLogResponseDTO> getRecentLogs(int limit);

    Map<String, Object> getStatistics();
}