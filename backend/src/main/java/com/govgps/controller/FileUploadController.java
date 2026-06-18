package com.govgps.controller;

import com.govgps.model.FileRecord;
import com.govgps.repository.FileRecordRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileUploadController {

    @Value("${app.upload.dir:./data/uploads}")
    private String uploadDir;

    private final FileRecordRepository fileRecordRepository;

    public FileUploadController(FileRecordRepository fileRecordRepository) {
        this.fileRecordRepository = fileRecordRepository;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "relatedServiceId", required = false) Long relatedServiceId,
            @RequestParam(value = "uploadedBy", required = false, defaultValue = "1") Long uploadedBy) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        // Validate file type - only allow Word and PDF files
        String originalFilename = file.getOriginalFilename();
        String contentType = file.getContentType();
        
        boolean isValidType = false;
        if (originalFilename != null) {
            String filename = originalFilename.toLowerCase();
            if ((filename.endsWith(".doc") || filename.endsWith(".docx") || filename.endsWith(".pdf")) &&
                (contentType != null && (contentType.contains("word") || contentType.contains("document") || contentType.equals("application/pdf")))) {
                isValidType = true;
            }
        }
        
        if (!isValidType) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only Word (.doc, .docx) and PDF files are allowed"));
        }

        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String storedName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(storedName);

            // Save file to disk
            Files.copy(file.getInputStream(), filePath);

            // Create and save FileRecord
            FileRecord record = new FileRecord();
            record.setOriginalName(file.getOriginalFilename());
            record.setStoredName(storedName);
            record.setFilePath(filePath.toString());
            record.setContentType(file.getContentType());
            record.setFileSize(file.getSize());
            record.setUploadedAt(LocalDateTime.now());
            record.setUploadedBy(uploadedBy);
            record.setRelatedServiceId(relatedServiceId);

            FileRecord saved = fileRecordRepository.save(record);

            return ResponseEntity.ok(Map.of(
                    "id", saved.getId(),
                    "originalName", saved.getOriginalName(),
                    "storedName", saved.getStoredName(),
                    "fileSize", saved.getFileSize(),
                    "contentType", saved.getContentType(),
                    "uploadedAt", saved.getUploadedAt()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", "File upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable("id") Long id) {
        var record = fileRecordRepository.findById(id);
        if (record.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        File file = new File(record.get().getFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(record.get().getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + record.get().getOriginalName() + "\"")
                .body(resource);
    }

    @GetMapping("/list")
    public List<FileRecord> listFiles() {
        return fileRecordRepository.findAll();
    }

    @GetMapping("/service/{serviceId}")
    public List<FileRecord> listByService(@PathVariable("serviceId") Long serviceId) {
        return fileRecordRepository.findByRelatedServiceId(serviceId);
    }

    @GetMapping("/user/{userId}")
    public List<FileRecord> listByUser(@PathVariable("userId") Long userId) {
        return fileRecordRepository.findByUploadedBy(userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable("id") Long id) {
        return fileRecordRepository.findById(id)
                .map(record -> {
                    try {
                        Files.deleteIfExists(Paths.get(record.getFilePath()));
                        fileRecordRepository.deleteById(id);
                        return ResponseEntity.ok(Map.of("message", "File deleted"));
                    } catch (IOException e) {
                        return ResponseEntity.status(500).body(Map.of("error", "Delete failed: " + e.getMessage()));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
