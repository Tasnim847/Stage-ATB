// dto/response/ClientDataVerificationResponse.java
package org.example.stage_atb.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClientDataVerificationResponse {
    private Map<String, Object> extractedData;
    private Map<String, Object> clientData;
    private List<FieldMatch> matches;
    private Boolean globalMatch;
    private Double confidence;
    private List<String> warnings;
    private List<String> errors;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FieldMatch {
        private String field;
        private Object extractedValue;
        private Object clientValue;
        private Boolean match;
    }
}