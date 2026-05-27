package com.cvproje.resume.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private final Storage storage = new Storage();
    private final Security security = new Security();
    private final Ai ai = new Ai();

    public Storage getStorage() { return storage; }
    public Security getSecurity() { return security; }
    public Ai getAi() { return ai; }

    public static class Storage {
        private String uploadDir = "./uploads";
        public String getUploadDir() { return uploadDir; }
        public void setUploadDir(String uploadDir) { this.uploadDir = uploadDir; }
    }

    public static class Security {
        private final Jwt jwt = new Jwt();
        public Jwt getJwt() { return jwt; }
        public static class Jwt {
            private String secret;
            private long expirationMs = 86400000L;
            public String getSecret() { return secret; }
            public void setSecret(String secret) { this.secret = secret; }
            public long getExpirationMs() { return expirationMs; }
            public void setExpirationMs(long expirationMs) { this.expirationMs = expirationMs; }
        }
    }

    public static class Ai {
        private String baseUrl;
        private String apiKey;
        private int timeoutSeconds = 60;
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public int getTimeoutSeconds() { return timeoutSeconds; }
        public void setTimeoutSeconds(int timeoutSeconds) { this.timeoutSeconds = timeoutSeconds; }
    }
}
