package com.govgps.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.govgps.model.FileRecord;
import com.govgps.repository.FileRecordRepository;
import com.govgps.repository.ServiceApplicationRepository;
import java.time.LocalDateTime;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/files")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminFileController {
    private static final String UPLOAD_DIR = "uploads/";
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private static final String[] ALLOWED_TYPES = {"application/pdf", "image/jpeg", "image/png", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"};

    private final FileRecordRepository fileRecordRepository;
    private final ServiceApplicationRepository applicationRepository;

    public AdminFileController(FileRecordRepository fileRecordRepository, ServiceApplicationRepository applicationRepository) {
        this.fileRecordRepository = fileRecordRepository;
        this.applicationRepository = applicationRepository;
        // Ensure upload directory exists
        new File(UPLOAD_DIR).mkdirs();
    }

    /**
     * Download a file
     * GET /api/admin/files/{fileId}/download
     */
    @GetMapping("/{fileId}/download")
    public ResponseEntity<?> downloadFile(@PathVariable Long fileId) {
        try {
            var recordOptional = fileRecordRepository.findById(fileId);
            if (recordOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "File record not found"));
            }

            var record = recordOptional.get();
            Path filePath = Paths.get(record.getFilePath());

            if (!Files.exists(filePath)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "File not found on disk"));
            }

            Resource resource = new FileSystemResource(filePath);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + record.getOriginalName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, record.getContentType() != null ? record.getContentType() : Files.probeContentType(filePath))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to download file: " + e.getMessage()));
        }
    }

    /**
     * Upload certificate file
     * POST /api/admin/files/upload-certificate
     */
    @PostMapping("/upload-certificate")
    public ResponseEntity<?> uploadCertificate(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long applicationId) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File is empty"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File size exceeds maximum limit of 50MB"));
            }

            String contentType = file.getContentType();
            if (!isAllowedContentType(contentType)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File type not allowed. Allowed types: PDF, JPEG, PNG, DOC, DOCX"));
            }

            // Save file with unique name
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".tmp";
            String uniqueFilename = "cert_" + applicationId + "_" + UUID.randomUUID() + fileExtension;

            Path uploadPath = Paths.get(UPLOAD_DIR + uniqueFilename);
            Files.write(uploadPath, file.getBytes());

            // Persist FileRecord to DB so other APIs can reference it
            FileRecord record = new FileRecord();
            record.setOriginalName(originalFilename);
            record.setStoredName(uniqueFilename);
            record.setFilePath(uploadPath.toString());
            record.setContentType(contentType);
            record.setFileSize(file.getSize());
            record.setUploadedAt(LocalDateTime.now());
            record.setUploadedBy(0L);
            record.setApplicationId(applicationId);
            // Attempt to set relatedServiceId from application
            try {
                var appOpt = applicationRepository.findById(applicationId);
                if (appOpt.isPresent()) {
                    record.setRelatedServiceId(appOpt.get().getService().getId());
                }
            } catch (Exception ignored) {}

            var saved = fileRecordRepository.save(record);

            return ResponseEntity.ok(Map.of(
                    "message", "Certificate uploaded successfully",
                    "fileId", saved.getId(),
                    "originalName", originalFilename,
                    "fileSize", file.getSize()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }

    /**
     * Upload user documents
     * POST /api/admin/files/upload-document
     */
    @PostMapping("/upload-document")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long userId,
            @RequestParam Long serviceId) {
        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File is empty"));
            }

            if (file.getSize() > MAX_FILE_SIZE) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File size exceeds maximum limit of 50MB"));
            }

            String contentType = file.getContentType();
            if (!isAllowedContentType(contentType)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File type not allowed"));
            }

            // Save file with unique name
            String originalFilename = file.getOriginalFilename();
            String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".tmp";
            String uniqueFilename = "doc_" + userId + "_" + serviceId + "_" + UUID.randomUUID() + fileExtension;

            Path uploadPath = Paths.get(UPLOAD_DIR + uniqueFilename);
            Files.write(uploadPath, file.getBytes());

            return ResponseEntity.ok(Map.of(
                    "message", "Document uploaded successfully",
                    "fileId", uniqueFilename,
                    "originalName", originalFilename,
                    "fileSize", file.getSize(),
                    "uploadedAt", System.currentTimeMillis()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload document: " + e.getMessage()));
        }
    }

    /**
     * Validate if content type is allowed
     */
    private boolean isAllowedContentType(String contentType) {
        if (contentType == null) {
            return false;
        }
        for (String allowed : ALLOWED_TYPES) {
            if (contentType.equals(allowed) || contentType.startsWith(allowed.split(";")[0])) {
                return true;
            }
        }
        return false;
    }
}
