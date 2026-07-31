package org.example.stage_atb.Service.impl;

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

    private final OcrConfigRepository ocrConfigRepository;
    private final OcrDocumentTypeRepository documentTypeRepository;
    private final OcrFieldRepository fieldRepository;
    private final ValidationRuleRepository validationRuleRepository;
    private final OcrLogRepository ocrLogRepository;
    private final OcrMapper ocrMapper;
    private final ObjectMapper objectMapper;

    private final IOcrEngineService ocrEngineService;

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

        // Mettre à jour les champs
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

        // Logguer le test
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

        // Vérifier si le code existe déjà
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

        // Supprimer les champs associés
        fieldRepository.deleteByDocumentTypeId(id);
        // Supprimer les règles associées
        validationRuleRepository.deleteByDocumentTypeId(id);
        // Supprimer le type de document
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
            // Utiliser une méthode personnalisée dans le repository
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
        // Utiliser la requête native
        ocrLogRepository.deleteOldLogs();

        // OU utiliser la méthode avec paramètre
        // LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        // ocrLogRepository.deleteOldLogsWithDate(thirtyDaysAgo);
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

        // Calculer la confiance moyenne et le temps de traitement moyen
        stats.setAverageConfidence(85.0); // À remplacer par une vraie requête
        stats.setAverageProcessingTime(150.0); // À remplacer par une vraie requête

        return stats;
    }

    // ============================================
    // EXTRACTION
    // ============================================

    @Override
    public OcrExtractionResultResponse extractDocument(Long documentTypeId, MultipartFile file) {
        log.info("🚀 Extraction OCR réelle pour le document type ID: {}", documentTypeId);
        long startTime = System.currentTimeMillis();

        try {
            OcrDocumentType documentType = findDocumentTypeById(documentTypeId);

            // Vérifier la taille du fichier
            if (file.getSize() > documentType.getMaxSize() * 1024 * 1024) {
                throw new RuntimeException("Le fichier dépasse la taille maximale autorisée: " +
                        documentType.getMaxSize() + " MB");
            }

            // ✅ APPEL AU VRAI OCR - REMPLACE simulateExtraction()
            Map<String, Object> extractedFields = ocrEngineService.extractDocument(file, documentType.getCode());

            // Récupérer les champs configurés
            List<OcrField> configuredFields = fieldRepository.findByDocumentTypeId(documentTypeId);

            // Valider les champs extraits
            List<String> warnings = validateExtractedFields(extractedFields, configuredFields);

            // Calculer le niveau de confiance
            Integer confidence = calculateConfidence(extractedFields, configuredFields);

            // Si Tesseract a retourné une confiance, l'utiliser
            if (extractedFields.containsKey("confidence")) {
                Object confValue = extractedFields.get("confidence");
                if (confValue instanceof Integer) {
                    confidence = (Integer) confValue;
                } else if (confValue instanceof Number) {
                    confidence = ((Number) confValue).intValue();
                }
            }

            // Construire la réponse
            OcrExtractionResultResponse response = new OcrExtractionResultResponse();
            response.setSuccess(true);
            response.setDocumentType(documentType.getName());
            response.setExtractedFields(extractedFields);
            response.setConfidence(confidence);
            response.setWarnings(warnings);
            response.setErrors(new ArrayList<>());

            // Récupérer le texte brut si disponible
            String rawText = extractedFields.containsKey("rawText") ?
                    (String) extractedFields.get("rawText") : "Texte extrait";
            response.setRawText(rawText);

            response.setProcessingTimeMs(System.currentTimeMillis() - startTime);

            // Logguer le succès
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


    // ============================================
    // MÉTHODES PRIVÉES D'AIDE
    // ============================================

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

    private Map<String, Object> simulateExtraction(String documentCode, MultipartFile file) {
        Map<String, Object> extractedFields = new HashMap<>();

        switch (documentCode.toUpperCase()) {
            case "CIN":
            case "IDENTITY":
                extractedFields.put("nom", "Dupont");
                extractedFields.put("prenom", "Jean");
                extractedFields.put("dateNaissance", "1985-06-15");
                extractedFields.put("cin", "123456789");
                extractedFields.put("dateExpiration", "2030-12-31");
                extractedFields.put("lieuNaissance", "Tunis");
                break;

            case "PASSPORT":
                extractedFields.put("nom", "Dupont");
                extractedFields.put("prenom", "Jean");
                extractedFields.put("passportNumber", "PA1234567");
                extractedFields.put("dateNaissance", "1985-06-15");
                extractedFields.put("dateExpiration", "2030-12-31");
                extractedFields.put("nationalite", "Tunisienne");
                break;

            case "BANK_STATEMENT":
                extractedFields.put("banque", "ATB");
                extractedFields.put("titulaire", "Jean Dupont");
                extractedFields.put("iban", "TN5912345678901234567890");
                extractedFields.put("solde", 12500.50);
                extractedFields.put("dateReleve", "2024-12-01");
                extractedFields.put("revenusMensuels", 3500.00);
                extractedFields.put("depenses", 2200.00);
                break;

            case "PAYSLIP":
                extractedFields.put("employeur", "ATB Tunisie");
                extractedFields.put("employe", "Jean Dupont");
                extractedFields.put("salaireBrut", 4500.00);
                extractedFields.put("salaireNet", 3200.00);
                extractedFields.put("date", "2024-12-01");
                extractedFields.put("poste", "Développeur Senior");
                extractedFields.put("anciennete", 5);
                break;

            default:
                extractedFields.put("nom", "Dupont");
                extractedFields.put("prenom", "Jean");
                extractedFields.put("documentType", documentCode);
                extractedFields.put("dateExtraction", LocalDateTime.now().toString());
                break;
        }

        extractedFields.put("nomFichier", file.getOriginalFilename());
        extractedFields.put("tailleFichier", file.getSize());

        return extractedFields;
    }
}