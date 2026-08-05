package org.example.stage_atb.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class KycAmlConfigResponse {
    private String id;
    private String category;
    private String name;
    private String description;
    private Boolean isActive;
    private Boolean required;
    private Integer priority;
    private Boolean autoCheck;
    private List<KycAmlCheckResponse> checks;
}