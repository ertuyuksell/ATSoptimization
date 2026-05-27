package com.cvproje.resume.service;

import com.cvproje.resume.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class AiServiceClient {

    private final WebClient client;

    public AiServiceClient(@Qualifier("aiServiceWebClient") WebClient client) {
        this.client = client;
    }

    public JsonNode analyzeResume(Path pdfPath, String originalFilename, String jobDescription) {
        byte[] bytes;
        try {
            bytes = Files.readAllBytes(pdfPath);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot read stored resume");
        }

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        ByteArrayResource resource = new ByteArrayResource(bytes) {
            @Override public String getFilename() { return originalFilename; }
        };
        builder.part("file", resource).contentType(MediaType.APPLICATION_PDF);
        if (jobDescription != null && !jobDescription.isBlank()) {
            builder.part("job_description", jobDescription);
        }

        try {
            return client.post()
                    .uri("/api/v1/analyze")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();
        } catch (WebClientResponseException ex) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "AI service error: " + ex.getStatusCode() + " " + ex.getResponseBodyAsString());
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "AI service unavailable: " + ex.getMessage());
        }
    }
}
