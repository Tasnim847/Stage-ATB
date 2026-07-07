// Service/impl/AuditLogServiceImpl.java - CORRIGÉ
package org.example.stage_atb.Service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IAuditLogService;
import org.example.stage_atb.dto.request.AuditLogFilterRequest;
import org.example.stage_atb.dto.response.AuditLogResponseDTO;
import org.example.stage_atb.entity.AuditLog;
import org.example.stage_atb.enums.ActionType;
import org.example.stage_atb.Mappers.AuditLogMapper;
import org.example.stage_atb.Repositories.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuditLogServiceImpl implements IAuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    public void logAction(String userId, String username, String email, String action, String details,
                          String ipAddress, String userAgent, String module, ActionType actionType,
                          String status, String errorMessage) {
        log.info("📝 Log action: {} - {} by {}", action, module, username);
        // Implémentation de l'enregistrement du log
    }

    @Override
    public Page<AuditLogResponseDTO> getAuditLogs(AuditLogFilterRequest filterRequest) {
        Pageable pageable = PageRequest.of(
                filterRequest.getPage(),
                filterRequest.getSize(),
                Sort.by(Sort.Direction.fromString(filterRequest.getSortDirection()), filterRequest.getSortBy())
        );

        // ✅ CORRIGÉ : Passer exactement 9 arguments comme défini dans le repository
        Page<AuditLog> auditLogPage = auditLogRepository.findWithFilters(
                filterRequest.getUserId(),
                filterRequest.getUsername(),
                filterRequest.getActionType(),
                filterRequest.getStatus(),
                filterRequest.getModule(),
                filterRequest.getStartDate(),
                filterRequest.getEndDate(),
                filterRequest.getSearchTerm(),
                pageable  // ✅ pageable contient déjà offset et limit
        );

        return auditLogPage.map(auditLogMapper::toResponseDTO);
    }

    @Override
    public List<AuditLogResponseDTO> getRecentLogs(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "timestamp"));
        Page<AuditLog> auditLogs = auditLogRepository.findAll(pageable);
        return auditLogs.getContent().stream()
                .map(auditLogMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalLogs", auditLogRepository.count());
        stats.put("successfulLogins", auditLogRepository.countSuccessfulLogins());
        stats.put("failedLogins", auditLogRepository.countFailedLogins());
        stats.put("today", auditLogRepository.countSince(LocalDateTime.now().withHour(0).withMinute(0).withSecond(0)));
        stats.put("thisWeek", auditLogRepository.countSince(LocalDateTime.now().minusDays(7)));
        stats.put("thisMonth", auditLogRepository.countSince(LocalDateTime.now().minusDays(30)));

        return stats;
    }
}