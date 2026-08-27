// Service/impl/OcrEngineService.java
package org.example.stage_atb.Service.impl;

import lombok.extern.slf4j.Slf4j;
import org.example.stage_atb.Service.IOcrEngineService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class OcrEngineService implements IOcrEngineService {

    @Override
    public Map<String, Object> extractDocument(MultipartFile file, String documentType) {
        log.info("🔍 Extraction OCR pour le document: {}, type: {}",
                file.getOriginalFilename(), documentType);

        Map<String, Object> extractedData = new HashMap<>();

        // Simuler l'extraction des données selon le type de document
        switch (documentType.toUpperCase()) {
            case "CIN":
            case "IDENTITY":
                extractedData.put("firstName", "Jean");
                extractedData.put("lastName", "Dupont");
                extractedData.put("birthDate", "1985-06-15");
                extractedData.put("identityNumber", "123456789");
                extractedData.put("address", "123 Rue de Tunis");
                extractedData.put("city", "Tunis");
                extractedData.put("country", "Tunisie");
                break;

            case "PASSPORT":
                extractedData.put("firstName", "Jean");
                extractedData.put("lastName", "Dupont");
                extractedData.put("passportNumber", "PA1234567");
                extractedData.put("birthDate", "1985-06-15");
                extractedData.put("country", "Tunisie");
                break;

            case "BANK_STATEMENT":
                extractedData.put("iban", "TN5912345678901234567890");
                extractedData.put("accountNumber", "123456789");
                extractedData.put("amount", 12500.50);
                break;

            default:
                extractedData.put("firstName", "Jean");
                extractedData.put("lastName", "Dupont");
                extractedData.put("documentType", documentType);
                extractedData.put("extractionDate", LocalDateTime.now().toString());
                break;
        }

        extractedData.put("fileName", file.getOriginalFilename());
        extractedData.put("fileSize", file.getSize());
        extractedData.put("confidence", 85);

        log.info("✅ Extraction OCR terminée avec {} champs extraits", extractedData.size());
        return extractedData;
    }
}