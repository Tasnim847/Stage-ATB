package org.example.stage_atb.Service.impl;

import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Mappers.DocumentMapper;
import org.example.stage_atb.Repositories.ClientRepository;
import org.example.stage_atb.Repositories.CreditRequestRepository;
import org.example.stage_atb.Repositories.DocumentRepository;
import org.example.stage_atb.Repositories.UserRepository;
import org.example.stage_atb.dto.request.DocumentUploadRequestDTO;
import org.example.stage_atb.dto.request.DocumentVerificationRequestDTO;
import org.example.stage_atb.dto.response.DocumentResponseDTO;
import org.example.stage_atb.entity.Client;
import org.example.stage_atb.entity.CreditRequest;
import org.example.stage_atb.entity.Document;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.DocumentType;
import org.example.stage_atb.enums.UserRole;
import org.example.stage_atb.exception.BusinessException;
import org.example.stage_atb.exception.ResourceNotFoundException;
import org.example.stage_atb.exception.UnauthorizedAccessException;
import org.example.stage_atb.Service.IDocumentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class DocumentService implements IDocumentService {

    private final DocumentRepository documentRepository;
    private final ClientRepository clientRepository;
    private final CreditRequestRepository creditRequestRepository;
    private final UserRepository userRepository;
    private final DocumentMapper documentMapper;

    @Value("${app.upload.directory:uploads/documents}")
    private String uploadDirectory;

    // Configuration des types de documents
    private static final Map<DocumentType, DocumentTypeConfig> DOCUMENT_TYPE_CONFIG = new EnumMap<>(DocumentType.class);

    static {
        // Configuration des types de documents obligatoires et leurs caractéristiques
        DOCUMENT_TYPE_CONFIG.put(DocumentType.IDENTITY_DOCUMENT,
                DocumentTypeConfig.builder()
                        .mandatory(true)
                        .requiresVerification(true)
                        .maxSizeMB(10)
                        .allowedFormats(new String[]{"pdf", "jpg", "jpeg", "png"})
                        .description("Pièce d'identité valide")
                        .build());

        DOCUMENT_TYPE_CONFIG.put(DocumentType.INCOME_PROOF,
                DocumentTypeConfig.builder()
                        .mandatory(true)
                        .requiresVerification(true)
                        .maxSizeMB(5)
                        .allowedFormats(new String[]{"pdf", "jpg", "jpeg", "png"})
                        .description("Justificatif de revenus")
                        .build());

        DOCUMENT_TYPE_CONFIG.put(DocumentType.BANK_STATEMENT,
                DocumentTypeConfig.builder()
                        .mandatory(true)
                        .requiresVerification(true)
                        .maxSizeMB(10)
                        .allowedFormats(new String[]{"pdf", "csv", "xls", "xlsx"})
                        .description("Relevé bancaire des 3 derniers mois")
                        .build());

        DOCUMENT_TYPE_CONFIG.put(DocumentType.PAYSLIP,
                DocumentTypeConfig.builder()
                        .mandatory(false)
                        .requiresVerification(true)
                        .maxSizeMB(5)
                        .allowedFormats(new String[]{"pdf", "jpg", "jpeg", "png"})
                        .description("Bulletin de salaire")
                        .build());

        DOCUMENT_TYPE_CONFIG.put(DocumentType.TAX_RETURN,
                DocumentTypeConfig.builder()
                        .mandatory(false)
                        .requiresVerification(true)
                        .maxSizeMB(5)
                        .allowedFormats(new String[]{"pdf"})
                        .description("Déclaration d'impôts")
                        .build());

        DOCUMENT_TYPE_CONFIG.put(DocumentType.PROPERTY_DOCUMENT,
                DocumentTypeConfig.builder()
                        .mandatory(false)
                        .requiresVerification(true)
                        .maxSizeMB(10)
                        .allowedFormats(new String[]{"pdf", "jpg", "jpeg", "png"})
                        .description("Titre de propriété")
                        .build());

        DOCUMENT_TYPE_CONFIG.put(DocumentType.CONTRACT,
                DocumentTypeConfig.builder()
                        .mandatory(false)
                        .requiresVerification(true)
                        .maxSizeMB(10)
                        .allowedFormats(new String[]{"pdf", "doc", "docx"})
                        .description("Contrat")
                        .build());

        DOCUMENT_TYPE_CONFIG.put(DocumentType.BUSINESS_REGISTRATION,
                DocumentTypeConfig.builder()
                        .mandatory(false)
                        .requiresVerification(true)
                        .maxSizeMB(5)
                        .allowedFormats(new String[]{"pdf", "jpg", "jpeg", "png"})
                        .description("Registre de commerce")
                        .build());

        DOCUMENT_TYPE_CONFIG.put(DocumentType.FINANCIAL_STATEMENT,
                DocumentTypeConfig.builder()
                        .mandatory(false)
                        .requiresVerification(true)
                        .maxSizeMB(10)
                        .allowedFormats(new String[]{"pdf", "xls", "xlsx"})
                        .description("États financiers")
                        .build());

        DOCUMENT_TYPE_CONFIG.put(DocumentType.OTHER,
                DocumentTypeConfig.builder()
                        .mandatory(false)
                        .requiresVerification(false)
                        .maxSizeMB(5)
                        .allowedFormats(new String[]{"pdf", "jpg", "jpeg", "png", "doc", "docx", "txt"})
                        .description("Autres documents")
                        .build());
    }

    // org.example.stage_atb.Service.impl.DocumentService.java

    @Override
    @Transactional
    public DocumentResponseDTO uploadDocument(DocumentUploadRequestDTO requestDTO) {
        log.info("Uploading document for client: {}", requestDTO.getClientId());

        // Vérifier si le client existe
        Client client = clientRepository.findById(requestDTO.getClientId())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + requestDTO.getClientId()));

        // Vérifier les permissions
        validateUploadPermissions(client);

        // Valider le type de document
        validateDocumentType(requestDTO.getDocumentType());

        // Valider le fichier
        MultipartFile file = requestDTO.getFile();
        validateFile(file, requestDTO.getDocumentType());

        // Créer le répertoire de téléchargement si nécessaire
        createUploadDirectoryIfNotExists();

        // Générer le nom du fichier
        String fileName = generateUniqueFileName(file.getOriginalFilename());
        String filePath = uploadDirectory + "/" + fileName;

        // Sauvegarder le fichier
        saveFile(file, filePath);

        // Créer l'entité Document
        Document document = documentMapper.toEntity(requestDTO);
        document.setFilePath(filePath);
        document.setUploadedBy(getCurrentUser());
        document.setComplete(true);

        // ✅ Utiliser le client récupéré de la base de données
        document.setClient(client);

        // ✅ Récupérer et associer la demande de crédit si présente
        if (requestDTO.getCreditRequestId() != null) {
            CreditRequest creditRequest = creditRequestRepository.findById(requestDTO.getCreditRequestId())
                    .orElseThrow(() -> new ResourceNotFoundException("Credit request not found with id: " + requestDTO.getCreditRequestId()));
            document.setCreditRequest(creditRequest);
            log.info("Document associated with credit request: {}", requestDTO.getCreditRequestId());
        }

        // Si c'est un document obligatoire, marquer comme tel
        if (isMandatoryDocument(requestDTO.getDocumentType())) {
            document.setVerified(false);
        }

        // Sauvegarder le document
        Document savedDocument = documentRepository.save(document);
        log.info("Document uploaded successfully with id: {}", savedDocument.getId());

        // Mettre à jour le statut de la demande de crédit si associée
        if (requestDTO.getCreditRequestId() != null) {
            updateCreditRequestStatus(requestDTO.getCreditRequestId());
        }

        return documentMapper.toResponseDTO(savedDocument);
    }

    @Override
    public DocumentResponseDTO getDocumentById(String id) {
        Document document = getDocumentEntity(id);
        validateDocumentAccess(document);
        return documentMapper.toResponseDTO(document);
    }

    @Override
    public List<DocumentResponseDTO> getDocumentsByClient(String clientId) {
        // Vérifier si le client existe
        clientRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));

        List<Document> documents = documentRepository.findByClientId(clientId);
        return documents.stream()
                .map(documentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentResponseDTO> getDocumentsByCreditRequest(String creditRequestId) {
        List<Document> documents = documentRepository.findByCreditRequestId(creditRequestId);
        return documents.stream()
                .map(documentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentResponseDTO> getDocumentsByType(DocumentType documentType) {
        List<Document> documents = documentRepository.findByDocumentType(documentType);
        return documents.stream()
                .map(documentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    // org.example.stage_atb.Service.impl.DocumentService.java

    @Override
    public List<DocumentResponseDTO> getAllDocuments() {
        log.info("Fetching all documents");
        try {
            // ✅ Récupérer l'utilisateur courant
            User currentUser = getCurrentUser();
            log.info("Current user role: {}", currentUser.getRole());

            // ✅ Vérifier les permissions
            if (!hasAdminOrAnalystRole(currentUser)) {
                log.warn("User {} with role {} tried to access all documents",
                        currentUser.getEmail(), currentUser.getRole());
                throw new UnauthorizedAccessException("Only administrators and analysts can view all documents");
            }

            List<Document> documents = documentRepository.findAll();
            log.info("Found {} documents", documents.size());

            return documents.stream()
                    .map(documentMapper::toResponseDTO)
                    .collect(Collectors.toList());

        } catch (ResourceNotFoundException | UnauthorizedAccessException e) {
            log.error("Error fetching all documents: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error fetching all documents: {}", e.getMessage(), e);
            throw new BusinessException("Error fetching documents: " + e.getMessage());
        }
    }
    
    @Override
    public DocumentResponseDTO updateDocument(String id, DocumentUploadRequestDTO requestDTO) {
        log.info("Updating document with id: {}", id);

        Document existingDocument = getDocumentEntity(id);
        validateDocumentModification(existingDocument);

        // Mettre à jour les champs autorisés
        if (requestDTO.getDescription() != null) {
            existingDocument.setDescription(requestDTO.getDescription());
        }
        if (requestDTO.getDocumentType() != null) {
            existingDocument.setDocumentType(requestDTO.getDocumentType());
        }

        Document updatedDocument = documentRepository.save(existingDocument);
        return documentMapper.toResponseDTO(updatedDocument);
    }

    @Override
    public void deleteDocument(String id) {
        log.info("Deleting document with id: {}", id);

        Document document = getDocumentEntity(id);
        validateDocumentModification(document);

        // Supprimer le fichier physique
        try {
            Path filePath = Paths.get(document.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Physical file deleted: {}", filePath);
            }
        } catch (IOException e) {
            log.error("Failed to delete physical file for document: {}", id, e);
        }

        documentRepository.delete(document);
        log.info("Document deleted successfully: {}", id);
    }

    @Override
    public DocumentResponseDTO verifyDocument(String id, boolean verified, String notes) {
        log.info("Verifying document with id: {}, status: {}", id, verified);

        Document document = getDocumentEntity(id);

        // Seuls les administrateurs et les analystes peuvent vérifier les documents
        User currentUser = getCurrentUser();
        if (!hasAdminOrAnalystRole(currentUser)) {
            throw new UnauthorizedAccessException("Only administrators and analysts can verify documents");
        }

        document.setVerified(verified);
        document.setVerificationNotes(notes);
        document.setComplete(verified);

        Document updatedDocument = documentRepository.save(document);

        // Mettre à jour le statut de la demande de crédit si associée
        if (document.getCreditRequest() != null) {
            updateCreditRequestStatus(document.getCreditRequest().getId());
        }

        return documentMapper.toResponseDTO(updatedDocument);
    }

    @Override
    public DocumentResponseDTO processDocumentWithOCR(String id) {
        log.info("Processing document with OCR: {}", id);

        Document document = getDocumentEntity(id);

        // Simuler le traitement OCR (à remplacer par une intégration réelle avec Tesseract ou autre)
        String simulatedOcrResult = simulateOCR(document);
        document.setOcrResult(simulatedOcrResult);

        Document updatedDocument = documentRepository.save(document);
        return documentMapper.toResponseDTO(updatedDocument);
    }

    @Override
    public DocumentResponseDTO extractDataFromDocument(String id) {
        log.info("Extracting data from document: {}", id);

        Document document = getDocumentEntity(id);

        // Simuler l'extraction de données (à remplacer par une intégration réelle)
        String simulatedExtractedData = simulateDataExtraction(document);
        document.setExtractedData(simulatedExtractedData);

        Document updatedDocument = documentRepository.save(document);
        return documentMapper.toResponseDTO(updatedDocument);
    }

    @Override
    public List<DocumentResponseDTO> getUnverifiedDocuments() {
        List<Document> documents = documentRepository.findUnverifiedDocuments();
        return documents.stream()
                .map(documentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DocumentResponseDTO> getIncompleteDocuments() {
        List<Document> documents = documentRepository.findIncompleteDocuments();
        return documents.stream()
                .map(documentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public byte[] downloadDocument(String id) {
        log.info("Downloading document with id: {}", id);

        Document document = getDocumentEntity(id);
        validateDocumentAccess(document);

        try {
            Path filePath = Paths.get(document.getFilePath());
            if (!Files.exists(filePath)) {
                throw new ResourceNotFoundException("File not found: " + document.getFilePath());
            }
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.error("Failed to download document: {}", id, e);
            throw new BusinessException("Failed to download document: " + e.getMessage());
        }
    }

    // Méthodes de gestion des types de documents

    public List<DocumentType> getMandatoryDocumentTypes() {
        return DOCUMENT_TYPE_CONFIG.entrySet().stream()
                .filter(entry -> entry.getValue().isMandatory())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    public Map<DocumentType, Boolean> getMandatoryDocumentStatusForClient(String clientId) {
        Map<DocumentType, Boolean> status = new HashMap<>();

        // Récupérer tous les types de documents obligatoires
        List<DocumentType> mandatoryTypes = getMandatoryDocumentTypes();

        // Récupérer les documents existants du client
        List<Document> clientDocuments = documentRepository.findByClientId(clientId);

        // Vérifier quels documents obligatoires sont présents
        for (DocumentType type : mandatoryTypes) {
            boolean hasDocument = clientDocuments.stream()
                    .anyMatch(doc -> doc.getDocumentType() == type && doc.isVerified());
            status.put(type, hasDocument);
        }

        return status;
    }

    public List<DocumentType> getMissingMandatoryDocuments(String clientId) {
        Map<DocumentType, Boolean> status = getMandatoryDocumentStatusForClient(clientId);
        return status.entrySet().stream()
                .filter(entry -> !entry.getValue())
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    public boolean isMandatoryDocument(DocumentType documentType) {
        DocumentTypeConfig config = DOCUMENT_TYPE_CONFIG.get(documentType);
        return config != null && config.isMandatory();
    }

    // Méthodes privées utilitaires

    private Document getDocumentEntity(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
    }

    // org.example.stage_atb.Service.impl.DocumentService.java

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedAccessException("User not authenticated");
        }

        String identifier = authentication.getName();
        log.info("Current user identifier: {}", identifier);

        // ✅ Essayer de trouver par email d'abord, puis par username
        Optional<User> userOpt = userRepository.findByEmail(identifier);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(identifier);
        }

        if (userOpt.isEmpty()) {
            log.error("User not found with identifier: {}", identifier);
            throw new ResourceNotFoundException("User not found: " + identifier);
        }

        log.info("User found: {} ({})", userOpt.get().getEmail(), userOpt.get().getRole());
        return userOpt.get();
    }

    private void validateUploadPermissions(Client client) {
        User currentUser = getCurrentUser();

        // Les administrateurs peuvent uploader pour n'importe quel client
        if (currentUser.getRole() == UserRole.ADMIN) {
            return;
        }

        // Les conseillers ne peuvent uploader que pour leurs clients
        if (currentUser.getRole() == UserRole.ADVISOR) {
            if (client.getAdvisor() == null || !client.getAdvisor().getId().equals(currentUser.getId())) {
                throw new UnauthorizedAccessException("You can only upload documents for your assigned clients");
            }
            return;
        }

        // Les analystes peuvent uploader pour tous les clients mais ne peuvent pas vérifier
        if (currentUser.getRole() == UserRole.ANALYST) {
            return;
        }

        throw new UnauthorizedAccessException("You don't have permission to upload documents");
    }

    private void validateDocumentAccess(Document document) {
        User currentUser = getCurrentUser();

        // Les administrateurs et analystes peuvent tout voir
        if (hasAdminOrAnalystRole(currentUser)) {
            return;
        }

        // Les conseillers ne peuvent voir que les documents de leurs clients
        if (currentUser.getRole() == UserRole.ADVISOR) {
            Client client = document.getClient();
            if (client.getAdvisor() == null || !client.getAdvisor().getId().equals(currentUser.getId())) {
                throw new UnauthorizedAccessException("You can only view documents for your assigned clients");
            }
        } else {
            throw new UnauthorizedAccessException("You don't have permission to access this document");
        }
    }

    private void validateDocumentModification(Document document) {
        User currentUser = getCurrentUser();

        // Seuls les administrateurs peuvent modifier des documents qu'ils n'ont pas créés
        if (currentUser.getRole() != UserRole.ADMIN) {
            if (!document.getUploadedBy().getId().equals(currentUser.getId())) {
                throw new UnauthorizedAccessException("You can only modify documents you uploaded");
            }
        }
    }

    private void validateDocumentType(DocumentType documentType) {
        if (documentType == null) {
            throw new BusinessException("Document type is required");
        }
    }

    private void validateFile(MultipartFile file, DocumentType documentType) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is required");
        }

        // Valider la taille
        DocumentTypeConfig config = DOCUMENT_TYPE_CONFIG.get(documentType);
        long maxSize = (config != null && config.getMaxSizeMB() != null)
                ? config.getMaxSizeMB() * 1024 * 1024
                : 10 * 1024 * 1024; // 10MB par défaut

        if (file.getSize() > maxSize) {
            throw new BusinessException(String.format("File size exceeds maximum allowed: %d MB", maxSize / (1024 * 1024)));
        }

        // Valider le format
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new BusinessException("Invalid file format");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        String[] allowedFormats = (config != null && config.getAllowedFormats() != null)
                ? config.getAllowedFormats()
                : new String[]{"pdf", "jpg", "jpeg", "png", "doc", "docx"};

        boolean isValidFormat = Arrays.asList(allowedFormats).contains(extension);
        if (!isValidFormat) {
            throw new BusinessException(String.format("Invalid file format. Allowed formats: %s",
                    String.join(", ", allowedFormats)));
        }

        // Vérifier le type MIME
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") &&
                !contentType.equals("application/pdf") &&
                !contentType.equals("application/msword") &&
                !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            throw new BusinessException("Invalid file content type");
        }
    }

    private void createUploadDirectoryIfNotExists() {
        try {
            Path uploadPath = Paths.get(uploadDirectory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created upload directory: {}", uploadDirectory);
            }
        } catch (IOException e) {
            log.error("Failed to create upload directory", e);
            throw new BusinessException("Failed to create upload directory");
        }
    }

    private String generateUniqueFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }

    private void saveFile(MultipartFile file, String filePath) {
        try {
            Path targetPath = Paths.get(filePath);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            log.info("File saved to: {}", filePath);
        } catch (IOException e) {
            log.error("Failed to save file", e);
            throw new BusinessException("Failed to save file: " + e.getMessage());
        }
    }

    private boolean hasAdminOrAnalystRole(User user) {
        return user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.ANALYST;
    }

    private void updateCreditRequestStatus(String creditRequestId) {
        // Vérifier tous les documents de la demande de crédit
        CreditRequest creditRequest = creditRequestRepository.findById(creditRequestId)
                .orElse(null);

        if (creditRequest != null) {
            // Compter les documents totaux et vérifiés
            List<Document> documents = documentRepository.findByCreditRequestId(creditRequestId);
            long totalDocuments = documents.size();
            long verifiedDocuments = documents.stream().filter(Document::isVerified).count();

            // Mettre à jour le statut en fonction du nombre de documents vérifiés
            // Logique à personnaliser selon les besoins
            log.info("Credit request {}: {} of {} documents verified", creditRequestId, verifiedDocuments, totalDocuments);
        }
    }

    private String simulateOCR(Document document) {
        // Simuler l'extraction OCR
        return String.format("""
            OCR Result for document: %s
            Type: %s
            Uploaded: %s
            Content: [Simulated OCR text content extracted from %s]
            """,
                document.getFileName(),
                document.getDocumentType(),
                document.getUploadedAt(),
                document.getFileName()
        );
    }

    private String simulateDataExtraction(Document document) {
        // Simuler l'extraction de données structurées
        return String.format("""
            {
              "documentId": "%s",
              "type": "%s",
              "extractedFields": {
                "fullName": "Simulated Name",
                "date": "%s",
                "amount": "0.00",
                "reference": "SIM-REF-%s"
              }
            }
            """,
                document.getId(),
                document.getDocumentType(),
                LocalDateTime.now().toLocalDate(),
                UUID.randomUUID().toString().substring(0, 8)
        );
    }

    // Inner class pour la configuration des types de documents
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    private static class DocumentTypeConfig {
        private boolean mandatory;
        private boolean requiresVerification;
        private Integer maxSizeMB;
        private String[] allowedFormats;
        private String description;
    }
}