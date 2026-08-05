package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.FraudRuleRequest;
import org.example.stage_atb.dto.response.FraudRuleResponse;
import org.example.stage_atb.entity.FraudRule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FraudRuleMapper {

    FraudRuleResponse toResponse(FraudRule entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", source = "isActive", defaultValue = "true")
    FraudRule toEntity(FraudRuleRequest request);
}