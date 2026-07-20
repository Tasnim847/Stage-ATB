package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.ClientRequestDTO;
import org.example.stage_atb.dto.response.ClientResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ClientMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "clientNumber", expression = "java(generateClientNumber())")
    @Mapping(target = "creditRequests", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "clientScoring", ignore = true)
    @Mapping(target = "kycVerifications", ignore = true)
    @Mapping(target = "fraudAlerts", ignore = true)
    @Mapping(target = "advisor", expression = "java(buildAdvisor(clientRequestDTO.getAdvisorId()))")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "active", constant = "true")
    Client toEntity(ClientRequestDTO clientRequestDTO);

    @Mapping(target = "advisorName", expression = "java(client.getAdvisor() != null ? client.getAdvisor().getFirstName() + \" \" + client.getAdvisor().getLastName() : null)")
    @Mapping(target = "advisorId", expression = "java(client.getAdvisor() != null ? client.getAdvisor().getId() : null)")
    // Mappers/ClientMapper.java - VÉRIFIER QUE LES CHAMPS SONT MAPPÉS
    @Mapping(target = "analystName", expression = "java(client.getAnalyst() != null ? client.getAnalyst().getFirstName() + \" \" + client.getAnalyst().getLastName() : null)")
    @Mapping(target = "analystId", expression = "java(client.getAnalyst() != null ? client.getAnalyst().getId() : null)")
    @Mapping(target = "totalCreditRequests", expression = "java(client.getCreditRequests() != null ? client.getCreditRequests().size() : 0)")
    @Mapping(target = "averageCreditScore", expression = "java(calculateAverageCreditScore(client))")
    @Mapping(target = "riskCategory", expression = "java(client.getClientScoring() != null ? client.getClientScoring().getRiskCategory() : null)")
    @Mapping(target = "overallScore", expression = "java(client.getClientScoring() != null ? client.getClientScoring().getOverallScore().doubleValue() : null)")
    ClientResponseDTO toResponseDTO(Client client);

    void updateEntity(@MappingTarget Client client, ClientRequestDTO clientRequestDTO);

    // Helper methods
    default String generateClientNumber() {
        return "CLT-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }

    default User buildAdvisor(String advisorId) {
        if (advisorId == null) return null;
        User user = new User();
        user.setId(advisorId);
        return user;
    }

    default Double calculateAverageCreditScore(Client client) {
        // This would be calculated based on credit history
        return 0.0;
    }
}