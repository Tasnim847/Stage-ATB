package org.example.stage_atb.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OcrConnectionStatusResponse {
    private Boolean success;
    private String message;
    private String provider;
    private String version;
    private LocalDateTime timestamp;
}

