// Service/IOcrEngineService.java
package org.example.stage_atb.Service;

import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

public interface IOcrEngineService {

    /**
     * Extrait les données d'un document en utilisant un moteur OCR
     * @param file Le fichier à analyser (PDF, JPG, PNG, etc.)
     * @param documentType Le type de document (CIN, PASSPORT, BANK_STATEMENT, etc.)
     * @return Map contenant les champs extraits
     * @throws RuntimeException en cas d'erreur d'extraction
     */
    Map<String, Object> extractDocument(MultipartFile file, String documentType);
}