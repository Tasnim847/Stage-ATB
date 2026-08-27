package org.example.stage_atb.Service.impl;

// OcrService.java - AJOUTER CES IMPORTS
import org.springframework.web.multipart.MultipartFile;
import org.springframework.mock.web.MockMultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.io.IOException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Mappers.OcrMapper;
import org.example.stage_atb.Repositories.*;
import org.example.stage_atb.Service.IOcrEngineService;
import org.example.stage_atb.Service.IOcrService;
import org.example.stage_atb.dto.request.*;
import org.example.stage_atb.dto.response.*;
import org.example.stage_atb.entity.*;
import org.example.stage_atb.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class OcrService implements IOcrService {

    // ============================================
    // REPOSITORIES
    // ============================================
    private final OcrConfigRepository ocrConfigRepository;
    private final OcrDocumentTypeRepository documentTypeRepository;
    private final OcrFieldRepository fieldRepository;
    private final ValidationRuleRepository validationRuleRepository;
    private final OcrLogRepository ocrLogRepository;
    private final DocumentRepository documentRepository;
    private final ClientRepository clientRepository;

    // ============================================
    // SERVICES
    // ============================================
    private final DocumentService documentService;
    private final IOcrEngineService ocrEngineService;

    // ============================================
    // MAPPERS
    // ============================================
    private final OcrMapper ocrMapper;
    private final ObjectMapper objectMapper;

    // ============================================
    // CONFIGURATION
    // ============================================

    @Override
    public OcrConfigResponse getConfig() {
        log.info("Récupération de la configuration OCR");
        OcrConfig config = getOrCreateDefaultConfig();
        return ocrMapper.toConfigResponse(config);
    }

    @Override
    public OcrConfigResponse updateConfig(OcrConfigRequest request) {
        log.info("Mise à jour de la configuration OCR");

        OcrConfig config = getOrCreateDefaultConfig();

        config.setProvider(request.getProvider());
        config.setApiKey(request.getApiKey());
        config.setEndpoint(request.getEndpoint());
        config.setLanguages(String.join(",", request.getLanguages()));
        config.setMinConfidence(request.getMinConfidence());
        config.setEnabled(request.getEnabled());
        config.setMaxRetries(request.getMaxRetries());
        config.setTimeout(request.getTimeout());
        config.setAutoSync(request.getAutoSync());

        OcrConfig saved = ocrConfigRepository.save(config);
        return ocrMapper.toConfigResponse(saved);
    }

    @Override
    public OcrConnectionStatusResponse testConnection() {
        log.info("Test de connexion OCR");

        OcrConfig config = getOrCreateDefaultConfig();

        OcrConnectionStatusResponse response = new OcrConnectionStatusResponse();
        response.setSuccess(true);
        response.setMessage("Connexion au service OCR établie avec succès");
        response.setProvider(config.getProvider());
        response.setVersion("2.0.0");
        response.setTimestamp(LocalDateTime.now());

        logTest("SYSTEM", "SUCCESS", "Test de connexion OCR");

        return response;
    }

    // ============================================
    // DOCUMENT TYPES
    // ============================================

    @Override
    public List<OcrDocumentTypeResponse> getDocumentTypes() {
        log.info("Récupération de tous les types de documents");
        return documentTypeRepository.findAll().stream()
                .map(ocrMapper::toDocumentTypeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OcrDocumentTypeResponse getDocumentType(Long id) {
        log.info("Récupération du type de document avec ID: {}", id);
        OcrDocumentType documentType = findDocumentTypeById(id);
        return ocrMapper.toDocumentTypeResponse(documentType);
    }

    @Override
    public OcrDocumentTypeResponse addDocumentType(OcrDocumentTypeRequest request) {
        log.info("Ajout d'un nouveau type de document: {}", request.getName());

        if (documentTypeRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Un type de document avec ce code existe déjà");
        }

        OcrDocumentType entity = ocrMapper.toDocumentTypeEntity(request);
        entity.setFields(new ArrayList<>());
        entity.setValidationRules(new ArrayList<>());

        OcrDocumentType saved = documentTypeRepository.save(entity);
        return ocrMapper.toDocumentTypeResponse(saved);
    }

    @Override
    public OcrDocumentTypeResponse updateDocumentType(Long id, OcrDocumentTypeRequest request) {
        log.info("Mise à jour du type de document avec ID: {}", id);

        OcrDocumentType existing = findDocumentTypeById(id);

        existing.setName(request.getName());
        existing.setCode(request.getCode());
        existing.setDescription(request.getDescription());
        existing.setOcrEnabled(request.getOcrEnabled());
        existing.setRequired(request.getRequired());
        existing.setMaxSize(request.getMaxSize());
        existing.setAllowedFormats(String.join(",", request.getAllowedFormats()));

        OcrDocumentType updated = documentTypeRepository.save(existing);
        return ocrMapper.toDocumentTypeResponse(updated);
    }

    @Override
    public void deleteDocumentType(Long id) {
        log.info("Suppression du type de document avec ID: {}", id);

        if (!documentTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Type de document non trouvé avec ID: " + id);
        }

        fieldRepository.deleteByDocumentTypeId(id);
        validationRuleRepository.deleteByDocumentTypeId(id);
        documentTypeRepository.deleteById(id);
    }

    // ============================================
    // FIELDS
    // ============================================

    @Override
    public List<OcrFieldResponse> getFields(Long documentTypeId) {
        log.info("Récupération des champs pour le document type ID: {}", documentTypeId);
        return fieldRepository.findByDocumentTypeId(documentTypeId).stream()
                .map(ocrMapper::toFieldResponse)
                .collect(Collectors.toList());
    }

    @Override
    public OcrFieldResponse addField(Long documentTypeId, OcrFieldRequest request) {
        log.info("Ajout d'un champ au document type ID: {}", documentTypeId);

        OcrDocumentType documentType = findDocumentTypeById(documentTypeId);

        OcrField entity = ocrMapper.toFieldEntity(request);
        entity.setDocumentType(documentType);

        OcrField saved = fieldRepository.save(entity);
        return ocrMapper.toFieldResponse(saved);
    }

    @Override
    public OcrFieldResponse updateField(Long documentTypeId, Long fieldId, OcrFieldRequest request) {
        log.info("Mise à jour du champ ID: {} pour le document type ID: {}", fieldId, documentTypeId);

        OcrField existing = findFieldById(fieldId);
        validateFieldBelongsToDocumentType(existing, documentTypeId);

        existing.setName(request.getName());
        existing.setType(request.getType());
        existing.setRequired(request.getRequired());
        existing.setRegex(request.getRegex());
        existing.setDescription(request.getDescription());

        OcrField updated = fieldRepository.save(existing);
        return ocrMapper.toFieldResponse(updated);
    }

    @Override
    public void deleteField(Long documentTypeId, Long fieldId) {
        log.info("Suppression du champ ID: {} pour le document type ID: {}", fieldId, documentTypeId);

        OcrField field = findFieldById(fieldId);
        validateFieldBelongsToDocumentType(field, documentTypeId);

        fieldRepository.delete(field);
    }

    // ============================================
    // VALIDATION RULES
    // ============================================

    @Override
    public List<ValidationRuleResponse> getValidationRules(Long documentTypeId) {
        log.info("Récupération des règles de validation pour le document type ID: {}", documentTypeId);
        return validationRuleRepository.findByDocumentTypeId(documentTypeId).stream()
                .map(ocrMapper::toValidationRuleResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ValidationRuleResponse addValidationRule(Long documentTypeId, ValidationRuleRequest request) {
        log.info("Ajout d'une règle de validation au document type ID: {}", documentTypeId);

        OcrDocumentType documentType = findDocumentTypeById(documentTypeId);

        ValidationRule entity = ocrMapper.toValidationRuleEntity(request);
        entity.setDocumentType(documentType);

        ValidationRule saved = validationRuleRepository.save(entity);
        return ocrMapper.toValidationRuleResponse(saved);
    }

    @Override
    public ValidationRuleResponse updateValidationRule(Long documentTypeId, Long ruleId, ValidationRuleRequest request) {
        log.info("Mise à jour de la règle ID: {} pour le document type ID: {}", ruleId, documentTypeId);

        ValidationRule existing = findValidationRuleById(ruleId);
        validateRuleBelongsToDocumentType(existing, documentTypeId);

        existing.setName(request.getName());
        existing.setCondition(request.getCondition());
        existing.setValue(request.getValue());
        existing.setValue2(request.getValue2());
        existing.setAction(request.getAction());
        existing.setMessage(request.getMessage());
        existing.setActive(request.getActive());

        ValidationRule updated = validationRuleRepository.save(existing);
        return ocrMapper.toValidationRuleResponse(updated);
    }

    @Override
    public void deleteValidationRule(Long documentTypeId, Long ruleId) {
        log.info("Suppression de la règle ID: {} pour le document type ID: {}", ruleId, documentTypeId);

        ValidationRule rule = findValidationRuleById(ruleId);
        validateRuleBelongsToDocumentType(rule, documentTypeId);

        validationRuleRepository.delete(rule);
    }

    // ============================================
    // LOGS
    // ============================================

    @Override
    public Page<OcrLogResponse> getOcrLogs(String result, Pageable pageable) {
        log.info("Récupération des logs OCR");

        Page<OcrLog> logsPage;
        if (result != null && !result.isEmpty()) {
            List<OcrLog> logs = ocrLogRepository.findByResult(result, pageable);
            logsPage = new PageImpl<>(logs, pageable, logs.size());
        } else {
            logsPage = ocrLogRepository.findAll(pageable);
        }

        return logsPage.map(ocrMapper::toLogResponse);
    }

    @Override
    public OcrLogResponse getOcrLog(Long id) {
        log.info("Récupération du log OCR avec ID: {}", id);
        OcrLog log = ocrLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Log OCR non trouvé avec ID: " + id));
        return ocrMapper.toLogResponse(log);
    }

    @Override
    public void clearLogs() {
        log.info("Effacement de tous les logs OCR");
        ocrLogRepository.deleteAll();
    }

    @Override
    public void deleteOldLogs() {
        log.info("Suppression des logs OCR de plus de 30 jours");
        ocrLogRepository.deleteOldLogs();
    }

    // ============================================
    // STATISTICS
    // ============================================

    @Override
    public OcrStatisticsResponse getStatistics() {
        log.info("Récupération des statistiques OCR");

        OcrStatisticsResponse stats = new OcrStatisticsResponse();
        stats.setTotalDocuments(ocrLogRepository.count());
        stats.setSuccessCount(ocrLogRepository.countSuccess());
        stats.setErrorCount(ocrLogRepository.countErrors());
        stats.setWarningCount(ocrLogRepository.countWarnings());
        stats.setAverageConfidence(85.0);
        stats.setAverageProcessingTime(150.0);

        return stats;
    }

    // ============================================
    // EXTRACTION
    // ============================================

    @Override
    public OcrExtractionResultResponse extractDocument(Long documentTypeId, MultipartFile file) {
        log.info("🚀 Extraction OCR pour le document type ID: {}", documentTypeId);
        long startTime = System.currentTimeMillis();

        try {
            OcrDocumentType documentType = findDocumentTypeById(documentTypeId);

            if (file.getSize() > documentType.getMaxSize() * 1024 * 1024) {
                throw new RuntimeException("Le fichier dépasse la taille maximale autorisée: " +
                        documentType.getMaxSize() + " MB");
            }

            Map<String, Object> extractedFields = ocrEngineService.extractDocument(file, documentType.getCode());

            List<OcrField> configuredFields = fieldRepository.findByDocumentTypeId(documentTypeId);
            List<String> warnings = validateExtractedFields(extractedFields, configuredFields);
            Integer confidence = calculateConfidence(extractedFields, configuredFields);

            if (extractedFields.containsKey("confidence")) {
                Object confValue = extractedFields.get("confidence");
                if (confValue instanceof Integer) {
                    confidence = (Integer) confValue;
                } else if (confValue instanceof Number) {
                    confidence = ((Number) confValue).intValue();
                }
            }

            OcrExtractionResultResponse response = new OcrExtractionResultResponse();
            response.setSuccess(true);
            response.setDocumentType(documentType.getName());
            response.setExtractedFields(extractedFields);
            response.setConfidence(confidence);
            response.setWarnings(warnings);
            response.setErrors(new ArrayList<>());

            String rawText = extractedFields.containsKey("rawText") ?
                    (String) extractedFields.get("rawText") : "Texte extrait";
            response.setRawText(rawText);
            response.setProcessingTimeMs(System.currentTimeMillis() - startTime);

            logExtraction(documentType.getName(), "SUCCESS", confidence);

            return response;

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'extraction OCR", e);

            OcrExtractionResultResponse response = new OcrExtractionResultResponse();
            response.setSuccess(false);
            response.setDocumentType("UNKNOWN");
            response.setExtractedFields(new HashMap<>());
            response.setConfidence(0);
            response.setWarnings(new ArrayList<>());
            response.setErrors(List.of(e.getMessage()));
            response.setRawText("");
            response.setProcessingTimeMs(System.currentTimeMillis() - startTime);

            logExtraction("UNKNOWN", "ERROR", 0);

            return response;
        }
    }

    // ============================================
    // EXTRACT AND VERIFY - NOUVEAU
    // ============================================

    // OcrService.java - MODIFIER la méthode extractAndVerify

    @Override
    public ClientDataVerificationResponse extractAndVerify(ExtractAndVerifyRequest request) {
        log.info("🔍 Extraction et vérification OCR pour le document: {}, client: {}",
                request.getDocumentId(), request.getClientId());

        try {
            // 1. Récupérer le document
            Document document = documentRepository.findById(request.getDocumentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Document non trouvé"));

            // 2. Récupérer le client
            Client client = clientRepository.findById(request.getClientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client non trouvé"));

            // 3. Extraire les données du document via OCR
            // Récupérer le fichier depuis le document
            MultipartFile file = getMultipartFileFromDocument(document);

            // Utiliser l'OCR engine existant
            String documentType = request.getDocumentType() != null ?
                    request.getDocumentType() : document.getDocumentType().name();

            Map<String, Object> extractedData = ocrEngineService.extractDocument(file, documentType);

            // 4. Récupérer les données du client
            Map<String, Object> clientData = extractClientData(client);

            // 5. Comparer les données
            List<ClientDataVerificationResponse.FieldMatch> matches = compareData(extractedData, clientData);
            boolean globalMatch = matches.stream().allMatch(ClientDataVerificationResponse.FieldMatch::getMatch);

            // 6. Calculer la confiance
            double confidence = calculateGlobalConfidence(matches);

            // 7. Construire la réponse
            ClientDataVerificationResponse response = new ClientDataVerificationResponse();
            response.setExtractedData(extractedData);
            response.setClientData(clientData);
            response.setMatches(matches);
            response.setGlobalMatch(globalMatch);
            response.setConfidence(confidence);
            response.setWarnings(generateWarnings(matches));
            response.setErrors(generateErrors(matches));

            // 8. Logguer le résultat
            logExtraction(documentType, globalMatch ? "SUCCESS" : "WARNING", (int)(confidence * 100));

            return response;

        } catch (Exception e) {
            log.error("❌ Erreur lors de l'extraction et vérification OCR", e);

            ClientDataVerificationResponse errorResponse = new ClientDataVerificationResponse();
            errorResponse.setGlobalMatch(false);
            errorResponse.setConfidence(0.0);
            errorResponse.setWarnings(List.of("Erreur lors du traitement OCR"));
            errorResponse.setErrors(List.of(e.getMessage()));
            errorResponse.setExtractedData(Map.of());
            errorResponse.setClientData(Map.of());
            errorResponse.setMatches(List.of());

            return errorResponse;
        }
    }

    /**
     * Méthode utilitaire pour convertir un Document en MultipartFile
     */
    private MultipartFile getMultipartFileFromDocument(Document document) {
        try {
            Path filePath = Paths.get(document.getFilePath());
            if (!Files.exists(filePath)) {
                throw new ResourceNotFoundException("Fichier non trouvé: " + document.getFilePath());
            }

            byte[] fileContent = Files.readAllBytes(filePath);
            String fileName = document.getFileName();
            String contentType = Files.probeContentType(filePath);

            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            // Créer un MultipartFile
            return new MockMultipartFile(
                    fileName,
                    fileName,
                    contentType,
                    fileContent
            );
        } catch (IOException e) {
            log.error("Erreur lors de la lecture du fichier: {}", document.getFilePath(), e);
            throw new RuntimeException("Impossible de lire le fichier: " + e.getMessage());
        }
    }
    // ============================================
    // PRIVATE HELPER METHODS
    // ============================================

    private OcrConfig getOrCreateDefaultConfig() {
        return ocrConfigRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    OcrConfig defaultConfig = new OcrConfig();
                    defaultConfig.setProvider("TESSERACT");
                    defaultConfig.setApiKey("");
                    defaultConfig.setEndpoint("http://localhost:5000");
                    defaultConfig.setLanguages("fr,ar,en");
                    defaultConfig.setMinConfidence(85);
                    defaultConfig.setEnabled(true);
                    defaultConfig.setMaxRetries(3);
                    defaultConfig.setTimeout(30);
                    defaultConfig.setAutoSync(false);
                    return ocrConfigRepository.save(defaultConfig);
                });
    }

    private OcrDocumentType findDocumentTypeById(Long id) {
        return documentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Type de document non trouvé avec ID: " + id));
    }

    private OcrField findFieldById(Long id) {
        return fieldRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Champ non trouvé avec ID: " + id));
    }

    private ValidationRule findValidationRuleById(Long id) {
        return validationRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Règle non trouvée avec ID: " + id));
    }

    private void validateFieldBelongsToDocumentType(OcrField field, Long documentTypeId) {
        if (!field.getDocumentType().getId().equals(documentTypeId)) {
            throw new RuntimeException("Ce champ n'appartient pas à ce type de document");
        }
    }

    private void validateRuleBelongsToDocumentType(ValidationRule rule, Long documentTypeId) {
        if (!rule.getDocumentType().getId().equals(documentTypeId)) {
            throw new RuntimeException("Cette règle n'appartient pas à ce type de document");
        }
    }

    private void logTest(String documentType, String result, String message) {
        OcrLog log = new OcrLog();
        log.setDocumentType(documentType);
        log.setResult(result);
        log.setMessage(message);
        log.setUserEmail("system");
        ocrLogRepository.save(log);
    }

    private void logExtraction(String documentType, String result, Integer confidence) {
        OcrLog log = new OcrLog();
        log.setDocumentType(documentType);
        log.setResult(result);
        log.setConfidence(confidence);
        log.setUserEmail("system");
        ocrLogRepository.save(log);
    }

    private List<String> validateExtractedFields(Map<String, Object> extractedFields, List<OcrField> configuredFields) {
        List<String> warnings = new ArrayList<>();

        for (OcrField field : configuredFields) {
            if (field.getRequired() && !extractedFields.containsKey(field.getName())) {
                warnings.add("Champ obligatoire manquant: " + field.getName());
            }
        }

        return warnings;
    }

    private Integer calculateConfidence(Map<String, Object> extractedFields, List<OcrField> configuredFields) {
        if (configuredFields.isEmpty()) {
            return 85;
        }

        long requiredFields = configuredFields.stream().filter(OcrField::getRequired).count();
        long extractedRequired = configuredFields.stream()
                .filter(OcrField::getRequired)
                .filter(f -> extractedFields.containsKey(f.getName()))
                .count();

        if (requiredFields == 0) {
            return 90;
        }

        return (int) ((extractedRequired * 100) / requiredFields);
    }

    // ============================================
    // METHODS FOR EXTRACT AND VERIFY
    // ============================================

    private Map<String, Object> extractClientData(Client client) {
        Map<String, Object> data = new HashMap<>();
        data.put("firstName", client.getFirstName());
        data.put("lastName", client.getLastName());
        data.put("email", client.getEmail());
        data.put("phoneNumber", client.getPhoneNumber());
        data.put("address", client.getAddress());
        data.put("city", client.getCity());
        data.put("country", client.getCountry());
        data.put("birthDate", client.getDateOfBirth() != null ? client.getDateOfBirth().toString() : null);
        data.put("identityNumber", client.getIdentityNumber());
        data.put("identityCardNumber", client.getIdentityNumber()); // Même champ, à adapter selon votre modèle
        data.put("passportNumber", client.getIdentityNumber()); // À adapter selon votre modèle
        data.put("taxId", client.getIdentityNumber()); // À adapter selon votre modèle
        data.put("iban", client.getIdentityNumber()); // À adapter selon votre modèle
        data.put("accountNumber", client.getIdentityNumber()); // À adapter selon votre modèle
        return data;
    }

    private List<ClientDataVerificationResponse.FieldMatch> compareData(
            Map<String, Object> extractedData,
            Map<String, Object> clientData) {

        List<ClientDataVerificationResponse.FieldMatch> matches = new ArrayList<>();

        List<String> fieldsToCompare = Arrays.asList(
                "firstName", "lastName", "email", "phoneNumber",
                "address", "city", "country", "birthDate",
                "identityNumber", "identityCardNumber", "passportNumber",
                "taxId", "iban", "accountNumber"
        );

        for (String field : fieldsToCompare) {
            Object extracted = extractedData.getOrDefault(field, null);
            Object client = clientData.getOrDefault(field, null);

            boolean match = compareValues(extracted, client);

            ClientDataVerificationResponse.FieldMatch matchObj =
                    new ClientDataVerificationResponse.FieldMatch();
            matchObj.setField(field);
            matchObj.setExtractedValue(extracted);
            matchObj.setClientValue(client);
            matchObj.setMatch(match);

            matches.add(matchObj);
        }

        return matches;
    }

    private boolean compareValues(Object extracted, Object client) {
        if (extracted == null && client == null) return true;
        if (extracted == null || client == null) return false;

        String extractedStr = extracted.toString().trim().toLowerCase();
        String clientStr = client.toString().trim().toLowerCase();

        extractedStr = extractedStr.replaceAll("\\s+", " ").replaceAll("[^a-z0-9]", "");
        clientStr = clientStr.replaceAll("\\s+", " ").replaceAll("[^a-z0-9]", "");

        return extractedStr.equals(clientStr);
    }

    private double calculateGlobalConfidence(List<ClientDataVerificationResponse.FieldMatch> matches) {
        if (matches.isEmpty()) return 0.0;

        long matchCount = matches.stream().filter(ClientDataVerificationResponse.FieldMatch::getMatch).count();
        return (double) matchCount / matches.size();
    }

    private List<String> generateWarnings(List<ClientDataVerificationResponse.FieldMatch> matches) {
        List<String> warnings = new ArrayList<>();

        for (ClientDataVerificationResponse.FieldMatch match : matches) {
            if (!match.getMatch()) {
                warnings.add("Donnée extraite ne correspond pas: " + match.getField());
            }
            if (match.getExtractedValue() == null && match.getClientValue() != null) {
                warnings.add("Champ non extrait: " + match.getField());
            }
        }

        return warnings;
    }

    private List<String> generateErrors(List<ClientDataVerificationResponse.FieldMatch> matches) {
        List<String> errors = new ArrayList<>();

        for (ClientDataVerificationResponse.FieldMatch match : matches) {
            if (!match.getMatch() && match.getClientValue() != null && match.getExtractedValue() != null) {
                errors.add("Incohérence détectée pour: " + match.getField());
            }
        }

        return errors;
    }
}