package org.example.stage_atb.Mappers;


import org.example.stage_atb.dto.request.KYCVerificationRequestDTO;
import org.example.stage_atb.dto.response.KYCVerificationResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.Document;
import org.example.stage_atb.entity.KYCVerification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface KYCVerificationMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "client", source = "clientId", qualifiedByName = "buildClient")
    @Mapping(target = "document", source = "documentId", qualifiedByName = "buildDocument")
    @Mapping(target = "verifiedBy", ignore = true)
    @Mapping(target = "verifiedAt", ignore = true)
    @Mapping(target = "fraudDetected", constant = "false")
    @Mapping(target = "fraudDetails", ignore = true)
    @Mapping(target = "verificationStatus", constant = "PENDING")
    @Mapping(target = "aiAnalysis", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    KYCVerification toEntity(KYCVerificationRequestDTO requestDTO);

    @Mapping(target = "clientId", expression = "java(kycVerification.getClient().getId())")
    @Mapping(target = "clientName", expression = "java(kycVerification.getClient().getFirstName() + \" \" + kycVerification.getClient().getLastName())")
    @Mapping(target = "documentId", expression = "java(kycVerification.getDocument() != null ? kycVerification.getDocument().getId() : null)")
    @Mapping(target = "documentName", expression = "java(kycVerification.getDocument() != null ? kycVerification.getDocument().getFileName() : null)")
    @Mapping(target = "verifiedBy", expression = "java(kycVerification.getVerifiedBy() != null ? kycVerification.getVerifiedBy().getId() : null)")
    @Mapping(target = "verifiedByName", expression = "java(kycVerification.getVerifiedBy() != null ? kycVerification.getVerifiedBy().getFirstName() + \" \" + kycVerification.getVerifiedBy().getLastName() : null)")
    KYCVerificationResponseDTO toResponseDTO(KYCVerification kycVerification);

    void updateEntity(@MappingTarget KYCVerification kycVerification, KYCVerificationRequestDTO requestDTO);

    @Named("buildClient")
    default Client buildClient(String clientId) {
        if (clientId == null) return null;
        Client client = new Client();
        client.setId(clientId);
        return client;
    }

    @Named("buildDocument")
    default Document buildDocument(String documentId) {
        if (documentId == null) return null;
        Document document = new Document();
        document.setId(documentId);
        return document;
    }
}