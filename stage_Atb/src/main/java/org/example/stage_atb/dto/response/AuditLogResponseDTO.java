// dto/response/AuditLogResponseDTO.java
package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.ActionType;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponseDTO {
    private String id;
    private String userId;
    private String username;
    private String email;
    private String action;
    private String details;
    private String ipAddress;
    private String userAgent;
    private String module;
    private ActionType actionType;
    private String status;
    private String errorMessage;
    private LocalDateTime timestamp;
}