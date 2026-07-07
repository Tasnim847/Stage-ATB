// entity/AuditLog.java - AVEC GETTERS DÉRIVÉS
package org.example.stage_atb.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.ActionType;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_request_id")
    private CreditRequest creditRequest;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String entityType;

    @Column(nullable = false)
    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String oldValue;

    @Column(columnDefinition = "TEXT")
    private String newValue;

    @Column(columnDefinition = "TEXT")
    private String details;

    private String ipAddress;

    private String userAgent;

    @CreationTimestamp
    private LocalDateTime timestamp;

    @Version
    private Long version;

    // ✅ GETTERS DÉRIVÉS (non persistants)
    @Transient
    public ActionType getActionType() {
        if (action == null) return null;
        String upperAction = action.toUpperCase();
        if (upperAction.contains("LOGIN")) return ActionType.LOGIN;
        if (upperAction.contains("LOGOUT")) return ActionType.LOGOUT;
        if (upperAction.contains("CREATE") || upperAction.contains("CREATION")) return ActionType.CREATE;
        if (upperAction.contains("UPDATE") || upperAction.contains("MODIFICATION")) return ActionType.UPDATE;
        if (upperAction.contains("DELETE") || upperAction.contains("SUPPRESSION")) return ActionType.DELETE;
        if (upperAction.contains("VIEW") || upperAction.contains("CONSULTATION")) return ActionType.VIEW;
        if (upperAction.contains("EXPORT")) return ActionType.EXPORT;
        if (upperAction.contains("IMPORT")) return ActionType.IMPORT;
        if (upperAction.contains("ASSIGN") || upperAction.contains("AFFECTATION")) return ActionType.ASSIGN;
        if (upperAction.contains("REASSIGN")) return ActionType.REASSIGN;
        if (upperAction.contains("ACTIVATE") || upperAction.contains("ACTIVATION")) return ActionType.ACTIVATE;
        if (upperAction.contains("DEACTIVATE") || upperAction.contains("DESACTIVATION")) return ActionType.DEACTIVATE;
        if (upperAction.contains("LOCK") || upperAction.contains("VERROUILLAGE")) return ActionType.LOCK;
        if (upperAction.contains("UNLOCK") || upperAction.contains("DEVERROUILLAGE")) return ActionType.UNLOCK;
        if (upperAction.contains("RESET") && upperAction.contains("PASSWORD")) return ActionType.RESET_PASSWORD;
        if (upperAction.contains("APPROVE") || upperAction.contains("APPROBATION")) return ActionType.APPROVE;
        if (upperAction.contains("REJECT") || upperAction.contains("REJET")) return ActionType.REJECT;
        if (upperAction.contains("VERIFY") || upperAction.contains("VERIFICATION")) return ActionType.VERIFY;
        return null;
    }

    @Transient
    public String getStatus() {
        if (details != null && details.contains("ERROR")) return "FAILURE";
        if (details != null && details.contains("WARNING")) return "WARNING";
        return "SUCCESS";
    }

    @Transient
    public String getErrorMessage() {
        if (details != null && details.contains("ERROR")) return details;
        return null;
    }

    @Transient
    public String getUserId() {
        return user != null ? user.getId() : null;
    }

    @Transient
    public String getUsername() {
        return user != null ? user.getUsername() : null;
    }

    @Transient
    public String getEmail() {
        return user != null ? user.getEmail() : null;
    }

    @Transient
    public String getModule() {
        return entityType;
    }
}