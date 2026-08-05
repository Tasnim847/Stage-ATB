package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.AIConfigRequest;
import org.example.stage_atb.dto.response.AIConfigResponse;
import org.example.stage_atb.entity.AIConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.context.annotation.Primary;

@Mapper(componentModel = "spring")
@Primary  // ✅ Ajouter @Primary pour résoudre le conflit
public interface AIConfigMapper {

    AIConfigResponse toResponse(AIConfig entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", source = "isActive", defaultValue = "true")
    @Mapping(target = "explanationRequired", source = "explanationRequired", defaultValue = "true")
    @Mapping(target = "minScore", source = "minScore", defaultValue = "0")
    AIConfig toEntity(AIConfigRequest request);
}