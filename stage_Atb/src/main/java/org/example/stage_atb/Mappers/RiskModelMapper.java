package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.RiskModelRequest;
import org.example.stage_atb.dto.response.RiskModelResponse;
import org.example.stage_atb.entity.RiskModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;

@Mapper(componentModel = "spring")
@Primary
public abstract class RiskModelMapper {

    @Autowired
    protected com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    @Mapping(target = "configuration", source = "configuration")
    public abstract RiskModelResponse toResponse(RiskModel entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "configuration", source = "configuration")
    public abstract RiskModel toEntity(RiskModelRequest request);

    // ✅ Plus besoin de sérialisation/désérialisation manuelle
    // car @Type(JsonType.class) gère automatiquement la conversion
}