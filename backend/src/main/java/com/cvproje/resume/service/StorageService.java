package com.cvproje.resume.service;

import com.cvproje.resume.config.AppProperties;
import com.cvproje.resume.exception.ApiException;
import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageService {

    private final AppProperties props;
    private Path root;

    public StorageService(AppProperties props) {
        this.props = props;
    }

    @PostConstruct
    void init() throws IOException {
        this.root = Paths.get(props.getStorage().getUploadDir()).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    public StoredFile store(MultipartFile file) {
        if (file.isEmpty()) throw new ApiException(HttpStatus.BAD_REQUEST, "Empty file");
        String original = file.getOriginalFilename() == null ? "resume.pdf" : file.getOriginalFilename();
        if (!original.toLowerCase().endsWith(".pdf")) {
            throw new ApiException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Only PDF files are accepted");
        }
        String stored = UUID.randomUUID() + "_" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
        Path target = root.resolve(stored);
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to store file");
        }
        return new StoredFile(original, target.toString(), file.getSize());
    }

    public Path resolve(String storagePath) {
        return Paths.get(storagePath);
    }

    public record StoredFile(String originalFilename, String storagePath, long size) {}
}
