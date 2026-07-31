package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.*;
import org.example.stage_atb.dto.response.*;
import org.example.stage_atb.entity.*;
import org.mapstruct.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Mapper(componentModel = "spring")
@Component
public interface OcrMapper {

    // ============================================
    // OCR CONFIG MAPPING
    // ============================================

    @Mapping(target = "languages", expression = "java(convertLanguagesToList(entity.getLanguages()))")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    OcrConfigResponse toConfigResponse(OcrConfig entity);

    @Mapping(target = "languages", expression = "java(convertLanguagesToString(request.getLanguages()))")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    OcrConfig toConfigEntity(OcrConfigRequest request);

    // ============================================
    // OCR DOCUMENT TYPE MAPPING
    // ============================================

    @Mapping(target = "allowedFormats", expression = "java(convertFormatsToList(entity.getAllowedFormats()))")
    @Mapping(target = "fields", source = "fields")
    @Mapping(target = "validationRules", source = "validationRules")
    @Mapping(target = "fieldCount", expression = "java(entity.getFields() != null ? entity.getFields().size() : 0)")
    @Mapping(target = "ruleCount", expression = "java(entity.getValidationRules() != null ? entity.getValidationRules().size() : 0)")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "updatedAt", source = "updatedAt")
    OcrDocumentTypeResponse toDocumentTypeResponse(OcrDocumentType entity);

    @Mapping(target = "allowedFormats", expression = "java(convertFormatsToString(request.getAllowedFormats()))")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "fields", ignore = true)
    @Mapping(target = "validationRules", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    OcrDocumentType toDocumentTypeEntity(OcrDocumentTypeRequest request);

    // ============================================
    // OCR FIELD MAPPING
    // ============================================

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "type", source = "type")
    @Mapping(target = "required", source = "required")
    @Mapping(target = "regex", source = "regex")
    @Mapping(target = "description", source = "description")
    OcrFieldResponse toFieldResponse(OcrField entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "documentType", ignore = true)
    OcrField toFieldEntity(OcrFieldRequest request);

    // ============================================
    // VALIDATION RULE MAPPING
    // ============================================

    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    @Mapping(target = "condition", source = "condition")
    @Mapping(target = "value", source = "value")
    @Mapping(target = "value2", source = "value2")
    @Mapping(target = "action", source = "action")
    @Mapping(target = "message", source = "message")
    @Mapping(target = "active", source = "active")
    ValidationRuleResponse toValidationRuleResponse(ValidationRule entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "documentType", ignore = true)
    ValidationRule toValidationRuleEntity(ValidationRuleRequest request);

    // ============================================
    // OCR LOG MAPPING
    // ============================================

    @Mapping(target = "id", source = "id")
    @Mapping(target = "documentType", source = "documentType")
    @Mapping(target = "documentId", source = "documentId")
    @Mapping(target = "result", source = "result")
    @Mapping(target = "confidence", source = "confidence")
    @Mapping(target = "message", source = "message")
    @Mapping(target = "duration", source = "duration")
    @Mapping(target = "userEmail", source = "userEmail")
    @Mapping(target = "createdAt", source = "createdAt")
    @Mapping(target = "extractedData", expression = "java(parseExtractedData(entity.getExtractedData()))")
    OcrLogResponse toLogResponse(OcrLog entity);

    // ⚠️ UTILISER @Named POUR LA SERIALISATION
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "extractedData", source = "extractedData", qualifiedByName = "serializeExtractedData")
    OcrLog toLogEntity(OcrLogRequest request);

    // ============================================
    // CONNECTION STATUS MAPPING
    // ============================================

    @Mapping(target = "timestamp", expression = "java(java.time.LocalDateTime.now())")
    OcrConnectionStatusResponse toConnectionStatusResponse(String provider, String version, Boolean success, String message);

    // ============================================
    // STATISTICS MAPPING
    // ============================================

    @Mapping(target = "documentTypeStats", ignore = true)
    @Mapping(target = "dailyStats", ignore = true)
    OcrStatisticsResponse toStatisticsResponse(
            Long totalDocuments,
            Long successCount,
            Long errorCount,
            Long warningCount,
            Double averageConfidence,
            Double averageProcessingTime
    );

    // ============================================
    // LIST MAPPING
    // ============================================

    List<OcrDocumentTypeResponse> toDocumentTypeResponseList(List<OcrDocumentType> entities);
    List<OcrFieldResponse> toFieldResponseList(List<OcrField> entities);
    List<ValidationRuleResponse> toValidationRuleResponseList(List<ValidationRule> entities);
    List<OcrLogResponse> toLogResponseList(List<OcrLog> entities);

    // ============================================
    // HELPER METHODS FOR TYPE CONVERSION
    // ============================================

    default List<String> convertLanguagesToList(String languages) {
        if (languages == null || languages.isEmpty()) {
            return List.of("fr", "ar", "en");
        }
        return Arrays.asList(languages.split(","));
    }

    default String convertLanguagesToString(List<String> languages) {
        if (languages == null || languages.isEmpty()) {
            return "fr,ar,en";
        }
        return String.join(",", languages);
    }

    default List<String> convertFormatsToList(String formats) {
        if (formats == null || formats.isEmpty()) {
            return List.of("PDF", "JPG", "PNG");
        }
        return Arrays.asList(formats.split(","));
    }

    default String convertFormatsToString(List<String> formats) {
        if (formats == null || formats.isEmpty()) {
            return "PDF,JPG,PNG";
        }
        return String.join(",", formats);
    }

    /**
     * Parse les données extraites du JSON stocké en base
     */
    default Map<String, Object> parseExtractedData(String extractedData) {
        if (extractedData == null || extractedData.isEmpty()) {
            return null;
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper =
                    new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.readValue(extractedData, Map.class);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Sérialise les données extraites en JSON pour le stockage
     * UTILISER @Named POUR QUE MAPSTRUCT L'UTILISE UNIQUEMENT QUAND DEMANDÉ
     */
    @Named("serializeExtractedData")
    default String serializeExtractedData(Object extractedData) {
        if (extractedData == null) {
            return null;
        }
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper =
                    new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.writeValueAsString(extractedData);
        } catch (Exception e) {
            return extractedData.toString();
        }
    }

    // ============================================
    // MÉTHODES DE CONVERSION GÉNÉRIQUES
    // ============================================

    default Boolean mapToBoolean(Object value) {
        if (value == null) return null;
        if (value instanceof Boolean) return (Boolean) value;
        if (value instanceof String) return Boolean.valueOf((String) value);
        if (value instanceof Number) return ((Number) value).intValue() != 0;
        return null;
    }

    default String mapToString(Object value) {
        return value != null ? value.toString() : null;
    }

    default Integer mapToInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof String) {
            try { return Integer.valueOf((String) value); }
            catch (NumberFormatException e) { return null; }
        }
        if (value instanceof Number) return ((Number) value).intValue();
        return null;
    }

    default List<String> mapToList(Object value) {
        if (value == null) return null;
        if (value instanceof List) return (List<String>) value;
        if (value instanceof String) return Arrays.asList(((String) value).split(","));
        return List.of(value.toString());
    }

    default Map<String, Object> mapToMap(Object value) {
        if (value == null) return null;
        if (value instanceof Map) return (Map<String, Object>) value;
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper =
                    new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.convertValue(value, Map.class);
        } catch (Exception e) {
            return null;
        }
    }
}