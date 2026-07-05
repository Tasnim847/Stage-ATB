// dto/request/ClientAssignRequest.java
package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientAssignRequest {
    private String clientId;
    private String advisorId;
    private List<String> clientIds;  // Pour l'affectation multiple
    private Boolean removeAdvisor;   // Pour retirer l'advisor
}