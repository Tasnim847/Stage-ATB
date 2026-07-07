// Mappers/AuditLogMapper.java
package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.response.AuditLogResponseDTO;
import org.example.stage_atb.entity.AuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    AuditLogMapper INSTANCE = Mappers.getMapper(AuditLogMapper.class);

    @Mapping(target = "userId", expression = "java(auditLog.getUserId())")
    @Mapping(target = "username", expression = "java(auditLog.getUsername())")
    @Mapping(target = "email", expression = "java(auditLog.getEmail())")
    @Mapping(target = "module", expression = "java(auditLog.getModule())")
    @Mapping(target = "actionType", expression = "java(auditLog.getActionType())")
    @Mapping(target = "status", expression = "java(auditLog.getStatus())")
    @Mapping(target = "errorMessage", expression = "java(auditLog.getErrorMessage())")
    AuditLogResponseDTO toResponseDTO(AuditLog auditLog);
}