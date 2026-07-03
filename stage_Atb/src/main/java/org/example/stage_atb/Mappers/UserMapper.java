package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.RegisterRequest;
import org.example.stage_atb.dto.response.UserResponseDTO;
import org.example.stage_atb.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "locked", constant = "false")
    @Mapping(target = "creditRequests", ignore = true)
    @Mapping(target = "riskAnalyses", ignore = true)
    @Mapping(target = "clients", ignore = true)
    @Mapping(target = "notifications", ignore = true)
    @Mapping(target = "auditLogs", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "profilePicture", ignore = true)
    User toEntity(RegisterRequest registerRequest);

    @Mapping(target = "totalCreditRequests", expression = "java(user.getCreditRequests() != null ? (long) user.getCreditRequests().size() : 0L)")
    @Mapping(target = "totalNotifications", expression = "java(user.getNotifications() != null ? (long) user.getNotifications().size() : 0L)")
    UserResponseDTO toResponseDTO(User user);

    void updateEntity(@MappingTarget User user, RegisterRequest registerRequest);
}