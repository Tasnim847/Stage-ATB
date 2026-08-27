package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.ExtractAndVerifyRequest;
import org.example.stage_atb.dto.request.OcrConfigRequest;
import org.example.stage_atb.dto.request.OcrDocumentTypeRequest;
import org.example.stage_atb.dto.request.OcrFieldRequest;
import org.example.stage_atb.dto.request.ValidationRuleRequest;
import org.example.stage_atb.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface IOcrService {

    // ============================================
    // CONFIGURATION
    // ============================================
    OcrConfigResponse getConfig();
    OcrConfigResponse updateConfig(OcrConfigRequest request);
    OcrConnectionStatusResponse testConnection();

    // ============================================
    // DOCUMENT TYPES
    // ============================================
    List<OcrDocumentTypeResponse> getDocumentTypes();
    OcrDocumentTypeResponse getDocumentType(Long id);
    OcrDocumentTypeResponse addDocumentType(OcrDocumentTypeRequest request);
    OcrDocumentTypeResponse updateDocumentType(Long id, OcrDocumentTypeRequest request);
    void deleteDocumentType(Long id);

    // ============================================
    // FIELDS
    // ============================================
    List<OcrFieldResponse> getFields(Long documentTypeId);
    OcrFieldResponse addField(Long documentTypeId, OcrFieldRequest request);
    OcrFieldResponse updateField(Long documentTypeId, Long fieldId, OcrFieldRequest request);
    void deleteField(Long documentTypeId, Long fieldId);

    // ============================================
    // VALIDATION RULES
    // ============================================
    List<ValidationRuleResponse> getValidationRules(Long documentTypeId);
    ValidationRuleResponse addValidationRule(Long documentTypeId, ValidationRuleRequest request);
    ValidationRuleResponse updateValidationRule(Long documentTypeId, Long ruleId, ValidationRuleRequest request);
    void deleteValidationRule(Long documentTypeId, Long ruleId);

    // ============================================
    // LOGS
    // ============================================
    Page<OcrLogResponse> getOcrLogs(String result, Pageable pageable);
    OcrLogResponse getOcrLog(Long id);
    void clearLogs();
    void deleteOldLogs();

    // ============================================
    // STATISTICS
    // ============================================
    OcrStatisticsResponse getStatistics();

    // ============================================
    // EXTRACTION
    // ============================================
    OcrExtractionResultResponse extractDocument(Long documentTypeId, MultipartFile file);

    // ============================================
    // EXTRACT AND VERIFY - NOUVEAU
    // ============================================
    ClientDataVerificationResponse extractAndVerify(ExtractAndVerifyRequest request);
}