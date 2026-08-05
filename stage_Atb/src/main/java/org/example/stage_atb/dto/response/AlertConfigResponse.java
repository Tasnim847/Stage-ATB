package org.example.stage_atb.dto.response;


import lombok.Data;
import java.util.List;

@Data
public class AlertConfigResponse {
    private String id;
    private String event;
    private String description;
    private List<String> recipients;
    private Boolean isActive;
    private String priority;
    private List<String> notificationMethods;
}
