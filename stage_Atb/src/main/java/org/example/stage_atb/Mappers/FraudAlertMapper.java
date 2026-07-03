package org.example.stage_atb.Mappers;


import org.example.stage_atb.dto.request.FraudAlertRequestDTO;
import org.example.stage_atb.dto.response.FraudAlertResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.FraudAlert;
import org.example.stage_atb.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface FraudAlertMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", source = "clientId", qualifiedByName = "buildClient")
    @Mapping(target = "creditRequest", source = "creditRequestId", qualifiedByName = "buildCreditRequest")
    @Mapping(target = "reviewedBy", ignore = true)
    @Mapping(target = "reviewed", constant = "false")
    @Mapping(target = "confirmed", constant = "false")
    @Mapping(target = "actionTaken", constant = "false")
    @Mapping(target = "actionNotes", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    FraudAlert toEntity(FraudAlertRequestDTO requestDTO);

    @Mapping(target = "clientId", expression = "java(fraudAlert.getClient().getId())")
    @Mapping(target = "clientName", expression = "java(fraudAlert.getClient().getFirstName() + \" \" + fraudAlert.getClient().getLastName())")
    @Mapping(target = "creditRequestId", expression = "java(fraudAlert.getCreditRequest() != null ? fraudAlert.getCreditRequest().getId() : null)")
    @Mapping(target = "reviewedBy", expression = "java(fraudAlert.getReviewedBy() != null ? fraudAlert.getReviewedBy().getFirstName() + \" \" + fraudAlert.getReviewedBy().getLastName() : null)")
    FraudAlertResponseDTO toResponseDTO(FraudAlert fraudAlert);

    void updateEntity(@MappingTarget FraudAlert fraudAlert, FraudAlertRequestDTO requestDTO);

    @Named("buildClient")
    default Client buildClient(String clientId) {
        if (clientId == null) return null;
        Client client = new Client();
        client.setId(clientId);
        return client;
    }

    @Named("buildCreditRequest")
    default CreditRequest buildCreditRequest(String creditRequestId) {
        if (creditRequestId == null) return null;
        CreditRequest creditRequest = new CreditRequest();
        creditRequest.setId(creditRequestId);
        return creditRequest;
    }
}