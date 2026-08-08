package org.example.stage_atb.Service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Mappers.*;
import org.example.stage_atb.Repositories.*;
import org.example.stage_atb.Service.IAuditLogService;
import org.example.stage_atb.Service.IRiskConfigurationService;
import org.example.stage_atb.dto.request.*;
import org.example.stage_atb.dto.response.*;
import org.example.stage_atb.entity.*;
import org.example.stage_atb.enums.ActionType;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RiskConfigurationServiceImpl implements IRiskConfigurationService {

    // Repositories
    private final RiskModelRepository riskModelRepository;
    private final RiskThresholdRepository riskThresholdRepository;
    private final FinancialRatioRepository financialRatioRepository;
    private final DecisionRuleRepository decisionRuleRepository;
    private final AlertConfigRepository alertConfigRepository;
    private final KycAmlConfigRepository kycAmlConfigRepository;
    private final AIConfigRepository aiConfigRepository;
    private final FraudRuleRepository fraudRuleRepository;

    // Mappers - Injectés par Spring grâce à @Mapper(componentModel = "spring")
    private final RiskModelMapper riskModelMapper;
    private final RiskThresholdMapper riskThresholdMapper;
    private final FinancialRatioMapper financialRatioMapper;
    private final DecisionRuleMapper decisionRuleMapper;
    private final AlertConfigMapper alertConfigMapper;
    private final KycAmlMapper kycAmlMapper;
    private final AIConfigMapper aiConfigMapper;
    private final FraudRuleMapper fraudRuleMapper;

    private final ObjectMapper objectMapper;
    private final IAuditLogService auditLogService;

    // ============================================
    // 1. MODÈLES DE RISQUE
    // ============================================

    @Override
    public List<RiskModelResponse> getRiskModels() {
        log.info("📋 Récupération de tous les modèles de risque");
        return riskModelRepository.findAllByOrderByPriorityAsc()
                .stream()
                .map(riskModelMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RiskModelResponse addRiskModel(RiskModelRequest request) {
        log.info("➕ Création d'un nouveau modèle de risque: {}", request.getName());

        RiskModel entity = riskModelMapper.toEntity(request);
        // ✅ Plus besoin de sérialiser manuellement
        // La configuration est déjà un objet, @Type(JsonType.class) s'en occupe
        entity = riskModelRepository.save(entity);

        logAudit("CREATE", "MODELE", entity.getId(), null, entity.getName());
        return riskModelMapper.toResponse(entity);
    }

    @Override
    public RiskModelResponse updateRiskModel(String id, RiskModelRequest request) {
        log.info("✏️ Mise à jour du modèle de risque: {}", id);

        RiskModel entity = riskModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modèle non trouvé avec l'id: " + id));

        String oldName = entity.getName();
        entity.setName(request.getName());
        entity.setType(request.getType());
        entity.setDescription(request.getDescription());
        entity.setPriority(request.getPriority());
        entity.setIsActive(request.getIsActive());
        // ✅ Plus besoin de sérialiser manuellement
        entity.setConfiguration(request.getConfiguration());

        entity = riskModelRepository.save(entity);

        logAudit("UPDATE", "MODELE", entity.getId(), oldName, entity.getName());
        return riskModelMapper.toResponse(entity);
    }

    @Override
    public void deleteRiskModel(String id) {
        log.info("🗑️ Suppression du modèle de risque: {}", id);

        if (!riskModelRepository.existsById(id)) {
            throw new RuntimeException("Modèle non trouvé avec l'id: " + id);
        }
        riskModelRepository.deleteById(id);

        logAudit("DELETE", "MODELE", id, "Modèle supprimé", null);
    }

    @Override
    public RiskModelResponse toggleRiskModel(String id, Boolean active) {
        log.info("🔄 Basculement du modèle de risque: {} -> {}", id, active);

        RiskModel entity = riskModelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Modèle non trouvé avec l'id: " + id));

        Boolean oldStatus = entity.getIsActive();
        entity.setIsActive(active);
        entity = riskModelRepository.save(entity);

        logAudit("TOGGLE", "MODELE", entity.getId(),
                String.valueOf(oldStatus), String.valueOf(active));
        return riskModelMapper.toResponse(entity);
    }

    // ============================================
    // 2. SEUILS DE RISQUE
    // ============================================

    @Override
    public List<RiskThresholdResponse> getRiskThresholds() {
        log.info("📋 Récupération de tous les seuils de risque");
        return riskThresholdRepository.findAll()
                .stream()
                .map(riskThresholdMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RiskThresholdResponse> updateRiskThresholds(List<RiskThresholdRequest> requests) {
        log.info("✏️ Mise à jour de tous les seuils de risque");

        // Supprimer les anciens seuils
        riskThresholdRepository.deleteAll();

        // ✅ CORRECTION : Utiliser un paramètre différent dans la lambda
        List<RiskThreshold> entities = requests.stream()
                .map(req -> {  // ✅ req au lieu de request
                    RiskThreshold entity = riskThresholdMapper.toEntity(req);
                    entity.setId(UUID.randomUUID().toString());
                    return entity;
                })
                .collect(Collectors.toList());

        entities = riskThresholdRepository.saveAll(entities);

        logAudit("UPDATE", "SEUILS", "ALL", "Anciens seuils supprimés", "Nouveaux seuils créés: " + entities.size());

        return entities.stream()
                .map(riskThresholdMapper::toResponse)
                .collect(Collectors.toList());
    }

    // ============================================
// 3. RATIOS FINANCIERS
// ============================================

    @Override
    public List<FinancialRatioResponse> getFinancialRatios() {
        log.info("📋 Récupération de tous les ratios financiers");

        // ✅ Vérifier si la table est vide et créer les données par défaut
        List<FinancialRatio> existingRatios = financialRatioRepository.findAll();
        if (existingRatios.isEmpty()) {
            log.info("⚠️ Aucun ratio trouvé, création des ratios par défaut");
            initDefaultFinancialRatios();
            existingRatios = financialRatioRepository.findAll();
        }

        return existingRatios.stream()
                .map(financialRatioMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FinancialRatioResponse addFinancialRatio(FinancialRatioRequest request) {
        log.info("➕ Création d'un nouveau ratio financier: {}", request.getName());

        FinancialRatio entity = financialRatioMapper.toEntity(request);
        entity.setId(UUID.randomUUID().toString());

        // ✅ Générer automatiquement la clé à partir du nom
        if (entity.getKey() == null || entity.getKey().isEmpty()) {
            entity.setKey(generateKeyFromName(request.getName()));
        }

        entity = financialRatioRepository.save(entity);

        logAudit("CREATE", "RATIO", entity.getId(), null, entity.getName());
        return financialRatioMapper.toResponse(entity);
    }

    // ✅ Méthode pour générer une clé à partir du nom
    private String generateKeyFromName(String name) {
        if (name == null) return "ratio_" + UUID.randomUUID().toString().substring(0, 8);

        return name
                .toLowerCase()
                .trim()
                .replaceAll("\\s+", "_")
                .replaceAll("[éèêë]", "e")
                .replaceAll("[àâä]", "a")
                .replaceAll("[ôö]", "o")
                .replaceAll("[ûü]", "u")
                .replaceAll("[îï]", "i")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9_]", "");
    }

    @Override
    public FinancialRatioResponse updateFinancialRatio(String id, FinancialRatioRequest request) {
        log.info("✏️ Mise à jour du ratio financier: {}", id);

        FinancialRatio entity = financialRatioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ratio financier non trouvé avec l'id: " + id));

        String oldName = entity.getName();

        // ✅ Mettre à jour les champs
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setMinValue(request.getMinValue());
        entity.setMaxValue(request.getMaxValue());
        entity.setCriticalMin(request.getCriticalMin());
        entity.setCriticalMax(request.getCriticalMax());
        entity.setUnit(request.getUnit());
        entity.setIsActive(request.getIsActive());
        entity.setPriority(request.getPriority());

        // ✅ Si la clé est null ou vide, la générer
        if (entity.getKey() == null || entity.getKey().isEmpty()) {
            entity.setKey(generateKeyFromName(entity.getName()));
        }

        entity = financialRatioRepository.save(entity);

        logAudit("UPDATE", "RATIO", entity.getId(), oldName, entity.getName());
        return financialRatioMapper.toResponse(entity);
    }

    private void initDefaultFinancialRatios() {
        log.info("📝 Initialisation des ratios financiers par défaut");

        List<FinancialRatio> defaultRatios = Arrays.asList(
                FinancialRatio.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Taux d'endettement maximal")
                        .description("Pourcentage maximum d'endettement autorisé par rapport aux revenus")
                        .key("debt_ratio")
                        .minValue(null)
                        .maxValue(40.0)
                        .criticalMin(null)
                        .criticalMax(45.0)
                        .unit("%")
                        .isActive(true)
                        .priority(1)
                        // ❌ SUPPRIMER createdAt et updatedAt car gérés par JPA
                        // .createdAt(LocalDateTime.now())
                        // .updatedAt(LocalDateTime.now())
                        .build(),
                FinancialRatio.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Capacité de remboursement minimale")
                        .description("Pourcentage minimum de capacité de remboursement requise")
                        .key("repayment_capacity")
                        .minValue(25.0)
                        .maxValue(100.0)
                        .criticalMin(20.0)
                        .criticalMax(null)
                        .unit("%")
                        .isActive(true)
                        .priority(2)
                        .build(),
                FinancialRatio.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Ratio de liquidité minimal")
                        .description("Ratio de liquidité générale minimum acceptable")
                        .key("liquidity_ratio")
                        .minValue(1.2)
                        .maxValue(10.0)
                        .criticalMin(1.0)
                        .criticalMax(null)
                        .unit("")
                        .isActive(true)
                        .priority(3)
                        .build(),
                FinancialRatio.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Ratio de solvabilité minimal")
                        .description("Ratio de solvabilité minimum acceptable")
                        .key("solvency_ratio")
                        .minValue(20.0)
                        .maxValue(100.0)
                        .criticalMin(15.0)
                        .criticalMax(null)
                        .unit("%")
                        .isActive(true)
                        .priority(4)
                        .build()
        );

        financialRatioRepository.saveAll(defaultRatios);
        log.info("✅ Ratios financiers par défaut créés avec succès");
    }

    // ============================================
    // 4. RÈGLES DE DÉCISION
    // ============================================

    @Override
    public List<DecisionRuleResponse> getDecisionRules() {
        log.info("📋 Récupération de toutes les règles de décision");
        return decisionRuleRepository.findAllByOrderByPriorityAsc()
                .stream()
                .map(decisionRuleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DecisionRuleResponse addDecisionRule(DecisionRuleRequest request) {
        log.info("➕ Création d'une nouvelle règle de décision: {}", request.getName());

        DecisionRule entity = decisionRuleMapper.toEntity(request);
        entity = decisionRuleRepository.save(entity);

        logAudit("CREATE", "REGLE", entity.getId(), null, entity.getName());
        return decisionRuleMapper.toResponse(entity);
    }

    @Override
    public DecisionRuleResponse updateDecisionRule(String id, DecisionRuleRequest request) {
        log.info("✏️ Mise à jour de la règle de décision: {}", id);

        DecisionRule entity = decisionRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Règle non trouvée avec l'id: " + id));

        String oldName = entity.getName();
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setCondition(request.getCondition());
        entity.setAction(request.getAction());
        entity.setPriority(request.getPriority());
        entity.setIsActive(request.getIsActive());

        entity = decisionRuleRepository.save(entity);

        logAudit("UPDATE", "REGLE", entity.getId(), oldName, entity.getName());
        return decisionRuleMapper.toResponse(entity);
    }

    @Override
    public void deleteDecisionRule(String id) {
        log.info("🗑️ Suppression de la règle de décision: {}", id);

        if (!decisionRuleRepository.existsById(id)) {
            throw new RuntimeException("Règle non trouvée avec l'id: " + id);
        }
        decisionRuleRepository.deleteById(id);

        logAudit("DELETE", "REGLE", id, "Règle supprimée", null);
    }

    @Override
    public DecisionRuleResponse toggleDecisionRule(String id, Boolean active) {
        log.info("🔄 Basculement de la règle de décision: {} -> {}", id, active);

        DecisionRule entity = decisionRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Règle non trouvée avec l'id: " + id));

        Boolean oldStatus = entity.getIsActive();
        entity.setIsActive(active);
        entity = decisionRuleRepository.save(entity);

        logAudit("TOGGLE", "REGLE", entity.getId(),
                String.valueOf(oldStatus), String.valueOf(active));
        return decisionRuleMapper.toResponse(entity);
    }

    @Override
    public void reorderRules(List<String> ruleIds) {
        log.info("🔄 Réorganisation des règles de décision");

        for (int i = 0; i < ruleIds.size(); i++) {
            String ruleId = ruleIds.get(i);
            DecisionRule entity = decisionRuleRepository.findById(ruleId)
                    .orElseThrow(() -> new RuntimeException("Règle non trouvée avec l'id: " + ruleId));
            entity.setPriority(i + 1);
            decisionRuleRepository.save(entity);
        }

        logAudit("REORDER", "REGLES", "ALL", null, "Nouvel ordre: " + String.join(", ", ruleIds));
    }

    // ============================================
    // 5. ALERTES
    // ============================================

    @Override
    public List<AlertConfigResponse> getAlertConfigs() {
        log.info("📋 Récupération de toutes les alertes");
        return alertConfigRepository.findByIsActiveTrue()
                .stream()
                .map(alertConfigMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public AlertConfigResponse addAlertConfig(AlertConfigRequest request) {
        log.info("➕ Création d'une nouvelle alerte: {}", request.getEvent());

        AlertConfig entity = alertConfigMapper.toEntity(request);
        entity = alertConfigRepository.save(entity);

        logAudit("CREATE", "ALERTE", entity.getId(), null, entity.getEvent());
        return alertConfigMapper.toResponse(entity);
    }

    @Override
    public AlertConfigResponse updateAlertConfig(String id, AlertConfigRequest request) {
        log.info("✏️ Mise à jour de l'alerte: {}", id);

        AlertConfig entity = alertConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alerte non trouvée avec l'id: " + id));

        String oldEvent = entity.getEvent();
        entity.setEvent(request.getEvent());
        entity.setDescription(request.getDescription());
        entity.setRecipients(String.join(",", request.getRecipients()));
        entity.setIsActive(request.getIsActive());
        entity.setPriority(request.getPriority());
        entity.setNotificationMethods(String.join(",", request.getNotificationMethods()));

        entity = alertConfigRepository.save(entity);

        logAudit("UPDATE", "ALERTE", entity.getId(), oldEvent, entity.getEvent());
        return alertConfigMapper.toResponse(entity);
    }

    @Override
    public void deleteAlertConfig(String id) {
        log.info("🗑️ Suppression de l'alerte: {}", id);

        if (!alertConfigRepository.existsById(id)) {
            throw new RuntimeException("Alerte non trouvée avec l'id: " + id);
        }
        alertConfigRepository.deleteById(id);

        logAudit("DELETE", "ALERTE", id, "Alerte supprimée", null);
    }

    @Override
    public AlertConfigResponse toggleAlertConfig(String id, Boolean active) {
        log.info("🔄 Basculement de l'alerte: {} -> {}", id, active);

        AlertConfig entity = alertConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Alerte non trouvée avec l'id: " + id));

        Boolean oldStatus = entity.getIsActive();
        entity.setIsActive(active);
        entity = alertConfigRepository.save(entity);

        logAudit("TOGGLE", "ALERTE", entity.getId(),
                String.valueOf(oldStatus), String.valueOf(active));
        return alertConfigMapper.toResponse(entity);
    }

    // ============================================
    // 6. KYC / AML
    // ============================================

    @Override
    public List<KycAmlConfigResponse> getKycAmlConfigs() {
        log.info("📋 Récupération de toutes les configurations KYC/AML");
        return kycAmlConfigRepository.findByIsActiveTrue()
                .stream()
                .map(kycAmlMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public KycAmlConfigResponse updateKycAmlConfig(String id, KycAmlConfigRequest request) {
        log.info("✏️ Mise à jour de la configuration KYC/AML: {}", id);

        KycAmlConfig entity = kycAmlConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuration KYC/AML non trouvée avec l'id: " + id));

        String oldName = entity.getName();
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setIsActive(request.getIsActive());
        entity.setRequired(request.getRequired());
        entity.setPriority(request.getPriority());
        entity.setAutoCheck(request.getAutoCheck());

        // Mettre à jour les checks
        if (request.getChecks() != null) {
            // Supprimer les anciens checks
            entity.getChecks().clear();

            // Ajouter les nouveaux checks
            for (KycAmlCheckRequest checkRequest : request.getChecks()) {
                KycAmlCheck check = kycAmlMapper.toCheckEntity(checkRequest);
                check.setId(UUID.randomUUID().toString());
                check.setKycAmlConfig(entity);
                entity.getChecks().add(check);
            }
        }

        entity = kycAmlConfigRepository.save(entity);

        logAudit("UPDATE", "KYC_AML", entity.getId(), oldName, entity.getName());
        return kycAmlMapper.toResponse(entity);
    }

    @Override
    public KycAmlConfigResponse toggleKycAmlCheck(String configId, String checkId, Boolean active) {
        log.info("🔄 Basculement du check KYC/AML: {} -> {}", checkId, active);

        KycAmlConfig config = kycAmlConfigRepository.findById(configId)
                .orElseThrow(() -> new RuntimeException("Configuration KYC/AML non trouvée avec l'id: " + configId));

        for (KycAmlCheck check : config.getChecks()) {
            if (check.getId().equals(checkId)) {
                check.setIsActive(active);
                break;
            }
        }

        config = kycAmlConfigRepository.save(config);

        logAudit("TOGGLE", "KYC_AML_CHECK", checkId,
                String.valueOf(!active), String.valueOf(active));
        return kycAmlMapper.toResponse(config);
    }

    // ============================================
    // 7. IA CONFIG
    // ============================================

    @Override
    public AIConfigResponse getAIConfig() {
        log.info("📋 Récupération de la configuration IA");
        return aiConfigRepository.findByIsActiveTrue()
                .map(aiConfigMapper::toResponse)
                .orElse(null);
    }

    @Override
    public AIConfigResponse updateAIConfig(AIConfigRequest request) {
        log.info("✏️ Mise à jour de la configuration IA");

        AIConfig entity = aiConfigRepository.findByIsActiveTrue()
                .orElseGet(() -> AIConfig.builder().build());

        String oldModel = entity.getModel();
        entity.setProvider(request.getProvider());
        entity.setModel(request.getModel());
        entity.setTemperature(request.getTemperature());
        entity.setSystemPrompt(request.getSystemPrompt());
        entity.setLanguage(request.getLanguage());
        entity.setMinScore(request.getMinScore());
        entity.setExplanationRequired(request.getExplanationRequired());
        entity.setIsActive(request.getIsActive());

        entity = aiConfigRepository.save(entity);

        logAudit("UPDATE", "IA_CONFIG", entity.getId(), oldModel, entity.getModel());
        return aiConfigMapper.toResponse(entity);
    }

    // ============================================
    // 8. FRAUDE DETECTION
    // ============================================

    @Override
    public List<FraudRuleResponse> getFraudRules() {
        log.info("📋 Récupération de toutes les règles de fraude");
        return fraudRuleRepository.findByIsActiveTrue()
                .stream()
                .map(fraudRuleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FraudRuleResponse updateFraudRule(String id, FraudRuleRequest request) {
        log.info("✏️ Mise à jour de la règle de fraude: {}", id);

        FraudRule entity = fraudRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Règle de fraude non trouvée avec l'id: " + id));

        String oldName = entity.getName();
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setWeight(request.getWeight());
        entity.setIsActive(request.getIsActive());
        entity.setThreshold(request.getThreshold());

        entity = fraudRuleRepository.save(entity);

        logAudit("UPDATE", "FRAUDE", entity.getId(), oldName, entity.getName());
        return fraudRuleMapper.toResponse(entity);
    }

    @Override
    public FraudRuleResponse toggleFraudRule(String id, Boolean active) {
        log.info("🔄 Basculement de la règle de fraude: {} -> {}", id, active);

        FraudRule entity = fraudRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Règle de fraude non trouvée avec l'id: " + id));

        Boolean oldStatus = entity.getIsActive();
        entity.setIsActive(active);
        entity = fraudRuleRepository.save(entity);

        logAudit("TOGGLE", "FRAUDE", entity.getId(),
                String.valueOf(oldStatus), String.valueOf(active));
        return fraudRuleMapper.toResponse(entity);
    }
    // Ajouter ces méthodes dans RiskConfigurationServiceImpl

    @Override
    public FraudRuleResponse addFraudRule(FraudRuleRequest request) {
        log.info("➕ Création d'une nouvelle règle de fraude: {}", request.getName());

        FraudRule entity = fraudRuleMapper.toEntity(request);
        entity.setId(UUID.randomUUID().toString());
        entity = fraudRuleRepository.save(entity);

        logAudit("CREATE", "FRAUDE", entity.getId(), null, entity.getName());
        return fraudRuleMapper.toResponse(entity);
    }

    @Override
    public void deleteFraudRule(String id) {
        log.info("🗑️ Suppression de la règle de fraude: {}", id);

        FraudRule entity = fraudRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Règle de fraude non trouvée avec l'id: " + id));

        String ruleName = entity.getName();
        fraudRuleRepository.deleteById(id);

        logAudit("DELETE", "FRAUDE", id, ruleName, null);
    }

    @Override
    public List<FraudRuleResponse> resetFraudRules() {
        log.info("🔄 Réinitialisation des règles de fraude");

        // Supprimer toutes les règles existantes
        fraudRuleRepository.deleteAll();

        // Créer les règles par défaut
        List<FraudRule> defaultRules = Arrays.asList(
                FraudRule.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Revenus incohérents")
                        .description("Incohérence entre les revenus déclarés et les justificatifs")
                        .weight(20)
                        .isActive(true)
                        .threshold(60)
                        .build(),
                FraudRule.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Documents modifiés")
                        .description("Détection de modifications suspectes sur les documents")
                        .weight(30)
                        .isActive(true)
                        .threshold(50)
                        .build(),
                FraudRule.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Dossier dupliqué")
                        .description("Demande de crédit identique déjà soumise")
                        .weight(15)
                        .isActive(true)
                        .threshold(70)
                        .build(),
                FraudRule.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Faux relevé bancaire")
                        .description("Relevé bancaire suspect ou falsifié")
                        .weight(40)
                        .isActive(true)
                        .threshold(40)
                        .build(),
                FraudRule.builder()
                        .id(UUID.randomUUID().toString())
                        .name("Faux bulletin de salaire")
                        .description("Bulletin de salaire suspect ou falsifié")
                        .weight(35)
                        .isActive(true)
                        .threshold(45)
                        .build()
        );

        List<FraudRule> savedRules = fraudRuleRepository.saveAll(defaultRules);

        logAudit("RESET", "FRAUDE", "ALL", null, "Règles réinitialisées: " + savedRules.size());

        return savedRules.stream()
                .map(fraudRuleMapper::toResponse)
                .collect(Collectors.toList());
    }


    // ============================================
    // 9. EXPORT / IMPORT / RESET
    // ============================================

    @Override
    public ResponseEntity<Resource> exportConfiguration() throws Exception {
        log.info("📤 Export de la configuration");

        Map<String, Object> config = new HashMap<>();
        config.put("models", getRiskModels());
        config.put("thresholds", getRiskThresholds());
        config.put("ratios", getFinancialRatios());
        config.put("rules", getDecisionRules());
        config.put("alerts", getAlertConfigs());
        config.put("kycAml", getKycAmlConfigs());
        config.put("aiConfig", getAIConfig());
        config.put("fraudRules", getFraudRules());
        config.put("exportDate", LocalDateTime.now());

        String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(config);
        ByteArrayResource resource = new ByteArrayResource(json.getBytes());

        logAudit("EXPORT", "CONFIGURATION", "ALL", null, "Configuration exportée");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=risk-configuration-" + LocalDateTime.now().toLocalDate() + ".json")
                .contentType(MediaType.APPLICATION_JSON)
                .body(resource);
    }

    @Override
    public void importConfiguration(MultipartFile file) throws Exception {
        log.info("📥 Import de la configuration");

        String json = new String(file.getBytes());
        Map<String, Object> config = objectMapper.readValue(json, Map.class);

        // TODO: Traiter l'importation des données

        logAudit("IMPORT", "CONFIGURATION", "ALL", null, "Configuration importée avec " + config.size() + " sections");
    }

    @Override
    public void resetToDefaults() {
        log.info("🔄 Réinitialisation de la configuration");

        // Réinitialiser toutes les configurations
        riskThresholdRepository.deleteAll();
        decisionRuleRepository.deleteAll();
        riskModelRepository.deleteAll();
        financialRatioRepository.deleteAll();
        alertConfigRepository.deleteAll();
        kycAmlConfigRepository.deleteAll();
        aiConfigRepository.deleteAll();
        fraudRuleRepository.deleteAll();

        // Recréer les données par défaut
        initDefaultData();

        logAudit("RESET", "CONFIGURATION", "ALL", null, "Configuration réinitialisée aux valeurs par défaut");
    }

    // ============================================
    // INITIALISATION DES DONNÉES PAR DÉFAUT
    // ============================================

    private void initDefaultData() {
        log.info("📝 Initialisation des données par défaut");

        // 1. Modèles de risque
        List<RiskModel> defaultModels = Arrays.asList(
                RiskModel.builder()
                        .type("RISQUE_DE_CREDIT")
                        .name("Modèle Risque de Crédit")
                        .description("Analyse du risque de crédit basée sur IA et règles métier")
                        .isActive(true)
                        .priority(1)
                        .build(),
                RiskModel.builder()
                        .type("RISQUE_FINANCIER")
                        .name("Modèle Risque Financier")
                        .description("Analyse des ratios financiers et capacité de remboursement")
                        .isActive(true)
                        .priority(2)
                        .build(),
                RiskModel.builder()
                        .type("RISQUE_KYC")
                        .name("Vérification KYC")
                        .description("Vérification d'identité et des documents")
                        .isActive(true)
                        .priority(3)
                        .build()
        );
        riskModelRepository.saveAll(defaultModels);

        // 2. Seuils de risque
        List<RiskThreshold> defaultThresholds = Arrays.asList(
                RiskThreshold.builder()
                        .minScore(0)
                        .maxScore(30)
                        .level("FAIBLE")
                        .label("Faible")
                        .color("#4CAF50")
                        .alertLevel("AUCUNE")
                        .isActive(true)
                        .build(),
                RiskThreshold.builder()
                        .minScore(31)
                        .maxScore(60)
                        .level("MOYEN")
                        .label("Moyen")
                        .color("#FFC107")
                        .alertLevel("ANALYSTE")
                        .isActive(true)
                        .build(),
                RiskThreshold.builder()
                        .minScore(61)
                        .maxScore(80)
                        .level("ELEVE")
                        .label("Élevé")
                        .color("#FF9800")
                        .alertLevel("RESPONSABLE")
                        .isActive(true)
                        .build(),
                RiskThreshold.builder()
                        .minScore(81)
                        .maxScore(100)
                        .level("CRITIQUE")
                        .label("Critique")
                        .color("#F44336")
                        .alertLevel("ADMIN")
                        .isActive(true)
                        .build()
        );
        riskThresholdRepository.saveAll(defaultThresholds);

        // 3. Règles de décision
        List<DecisionRule> defaultRules = Arrays.asList(
                DecisionRule.builder()
                        .name("Refus automatique - Endettement élevé")
                        .description("Refuser automatiquement si le taux d'endettement dépasse 40%")
                        .condition("taux_endettement > 40")
                        .action("REFUSER_AUTOMATIQUEMENT")
                        .priority(1)
                        .isActive(true)
                        .build(),
                DecisionRule.builder()
                        .name("Acceptation automatique - Score IA faible")
                        .description("Accepter automatiquement si le score IA est inférieur à 30")
                        .condition("score_IA < 30")
                        .action("ACCEPTER_AUTOMATIQUEMENT")
                        .priority(2)
                        .isActive(true)
                        .build(),
                DecisionRule.builder()
                        .name("Blocage - Document manquant")
                        .description("Bloquer le dossier si des documents sont manquants")
                        .condition("document_manquant")
                        .action("BLOQUER_LE_DOSSIER")
                        .priority(3)
                        .isActive(true)
                        .build()
        );
        decisionRuleRepository.saveAll(defaultRules);

        log.info("✅ Données par défaut initialisées avec succès");
    }

    // ============================================
    // LOG D'AUDIT
    // ============================================

    private void logAudit(String action, String module, String entityId, String oldValue, String newValue) {
        try {
            String details = String.format("Module: %s, Entity: %s, Old: %s, New: %s",
                    module, entityId, oldValue, newValue);
            auditLogService.logAction(
                    null,
                    "SYSTEM",
                    "system@atb.com",
                    action,
                    details,
                    "127.0.0.1",
                    "System",
                    module,
                    ActionType.valueOf(action.toUpperCase()),
                    "SUCCESS",
                    null
            );
        } catch (Exception e) {
            log.error("Erreur lors de l'enregistrement du log d'audit", e);
        }
    }

    // Ajouter ces méthodes dans RiskConfigurationServiceImpl

    @Override
    public KycAmlConfigResponse addKycAmlConfig(KycAmlConfigRequest request) {
        log.info("➕ Création d'une nouvelle configuration KYC/AML: {}", request.getName());

        KycAmlConfig entity = kycAmlMapper.toEntity(request);
        entity.setId(UUID.randomUUID().toString());

        // Initialiser les checks
        if (request.getChecks() != null) {
            List<KycAmlCheck> checks = new ArrayList<>();
            for (KycAmlCheckRequest checkRequest : request.getChecks()) {
                KycAmlCheck check = kycAmlMapper.toCheckEntity(checkRequest);
                check.setId(UUID.randomUUID().toString());
                check.setKycAmlConfig(entity);
                checks.add(check);
            }
            entity.setChecks(checks);
        }

        entity = kycAmlConfigRepository.save(entity);

        logAudit("CREATE", "KYC_AML", entity.getId(), null, entity.getName());
        return kycAmlMapper.toResponse(entity);
    }

    @Override
    public void deleteKycAmlConfig(String id) {
        log.info("🗑️ Suppression de la configuration KYC/AML: {}", id);

        KycAmlConfig entity = kycAmlConfigRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Configuration KYC/AML non trouvée avec l'id: " + id));

        String configName = entity.getName();
        kycAmlConfigRepository.deleteById(id);

        logAudit("DELETE", "KYC_AML", id, configName, null);
    }
}