package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.KycAmlCheckRequest;
import org.example.stage_atb.dto.request.KycAmlConfigRequest;
import org.example.stage_atb.dto.response.KycAmlCheckResponse;
import org.example.stage_atb.dto.response.KycAmlConfigResponse;
import org.example.stage_atb.entity.KycAmlCheck;
import org.example.stage_atb.entity.KycAmlConfig;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface KycAmlMapper {

    @Mapping(target = "checks", source = "checks")
    KycAmlConfigResponse toResponse(KycAmlConfig entity);

    KycAmlCheckResponse toCheckResponse(KycAmlCheck entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "checks", ignore = true)
    @Mapping(target = "isActive", source = "isActive", defaultValue = "true")
    @Mapping(target = "required", source = "required", defaultValue = "false")
    @Mapping(target = "autoCheck", source = "autoCheck", defaultValue = "false")
    KycAmlConfig toEntity(KycAmlConfigRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "kycAmlConfig", ignore = true)
    @Mapping(target = "isActive", source = "isActive", defaultValue = "true")
    KycAmlCheck toCheckEntity(KycAmlCheckRequest request);
}