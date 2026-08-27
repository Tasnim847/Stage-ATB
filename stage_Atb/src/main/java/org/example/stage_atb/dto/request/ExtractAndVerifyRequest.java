// dto/request/ExtractAndVerifyRequest.java
package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExtractAndVerifyRequest {
    private String documentId;
    private String clientId;
    private String documentType;
}