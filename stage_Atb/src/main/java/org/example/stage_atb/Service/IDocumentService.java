package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.DocumentUploadRequestDTO;
import org.example.stage_atb.dto.response.DocumentResponseDTO;
import org.example.stage_atb.enums.DocumentType;

import java.util.List;
import java.util.Map;

public interface IDocumentService {

    DocumentResponseDTO uploadDocument(DocumentUploadRequestDTO documentUploadRequestDTO);

    DocumentResponseDTO getDocumentById(String id);

    List<DocumentResponseDTO> getDocumentsByClient(String clientId);

    List<DocumentResponseDTO> getDocumentsByCreditRequest(String creditRequestId);

    List<DocumentResponseDTO> getDocumentsByType(DocumentType documentType);

    List<DocumentResponseDTO> getAllDocuments();

    DocumentResponseDTO updateDocument(String id, DocumentUploadRequestDTO documentUploadRequestDTO);

    void deleteDocument(String id);

    DocumentResponseDTO verifyDocument(String id, boolean verified, String notes);

    DocumentResponseDTO processDocumentWithOCR(String id);

    DocumentResponseDTO extractDataFromDocument(String id);

    List<DocumentResponseDTO> getUnverifiedDocuments();

    List<DocumentResponseDTO> getIncompleteDocuments();

    byte[] downloadDocument(String id);

    // Méthodes supplémentaires pour la gestion des types de documents
    List<DocumentType> getMandatoryDocumentTypes();

    Map<DocumentType, Boolean> getMandatoryDocumentStatusForClient(String clientId);

    List<DocumentType> getMissingMandatoryDocuments(String clientId);

    boolean isMandatoryDocument(DocumentType documentType);
}