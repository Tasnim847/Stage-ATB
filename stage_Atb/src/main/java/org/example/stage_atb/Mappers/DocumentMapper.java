package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.DocumentUploadRequestDTO;
import org.example.stage_atb.dto.response.DocumentResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DocumentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fileName", expression = "java(documentUploadRequestDTO.getFile().getOriginalFilename())")
    @Mapping(target = "filePath", ignore = true)
    @Mapping(target = "fileType", expression = "java(documentUploadRequestDTO.getFile().getContentType())")
    @Mapping(target = "fileSize", expression = "java(documentUploadRequestDTO.getFile().getSize())")
    @Mapping(target = "client", expression = "java(buildClient(documentUploadRequestDTO.getClientId()))")
    @Mapping(target = "creditRequest", expression = "java(buildCreditRequest(documentUploadRequestDTO.getCreditRequestId()))")
    @Mapping(target = "uploadedBy", ignore = true)
    @Mapping(target = "ocrResult", ignore = true)
    @Mapping(target = "extractedData", ignore = true)
    @Mapping(target = "verified", constant = "false")
    @Mapping(target = "complete", constant = "false")
    @Mapping(target = "verificationNotes", ignore = true)
    @Mapping(target = "uploadedAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    Document toEntity(DocumentUploadRequestDTO documentUploadRequestDTO);

    @Mapping(target = "clientId", expression = "java(document.getClient().getId())")
    @Mapping(target = "clientName", expression = "java(document.getClient().getFirstName() + \" \" + document.getClient().getLastName())")
    @Mapping(target = "creditRequestId", expression = "java(document.getCreditRequest() != null ? document.getCreditRequest().getId() : null)")
    @Mapping(target = "uploadedBy", expression = "java(document.getUploadedBy() != null ? document.getUploadedBy().getId() : null)")
    @Mapping(target = "uploadedByName", expression = "java(document.getUploadedBy() != null ? document.getUploadedBy().getFirstName() + \" \" + document.getUploadedBy().getLastName() : null)")
    DocumentResponseDTO toResponseDTO(Document document);

    void updateEntity(@MappingTarget Document document, DocumentUploadRequestDTO documentUploadRequestDTO);

    default Client buildClient(String clientId) {
        if (clientId == null) return null;
        Client client = new Client();
        client.setId(clientId);
        return client;
    }

    default CreditRequest buildCreditRequest(String creditRequestId) {
        if (creditRequestId == null) return null;
        CreditRequest creditRequest = new CreditRequest();
        creditRequest.setId(creditRequestId);
        return creditRequest;
    }
}