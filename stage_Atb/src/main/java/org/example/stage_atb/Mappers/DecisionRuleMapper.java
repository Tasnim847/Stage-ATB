package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.DecisionRuleRequest;
import org.example.stage_atb.dto.response.DecisionRuleResponse;
import org.example.stage_atb.entity.DecisionRule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DecisionRuleMapper {

    DecisionRuleResponse toResponse(DecisionRule entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isActive", source = "isActive", defaultValue = "true")
    @Mapping(target = "priority", source = "priority", defaultValue = "0")
    DecisionRule toEntity(DecisionRuleRequest request);
}