package com.quanlydoan.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:4200")
public class FileController {

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam String path) {
        try {
            // Path từ query param đã được encode 1 lần, decode nó
            String decodedPath = path;
            
            // Nếu path chứa %5C (encoded backslash), thay bằng /
            decodedPath = decodedPath.replace("%5C", "/").replace("\\", "/");
            
            // Decode URL encoding
            decodedPath = java.net.URLDecoder.decode(decodedPath, StandardCharsets.UTF_8.name());
            
            File file = new File(decodedPath);
            
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(file);
            String fileName = file.getName();
            
            // Lấy extension để xác định content type
            String extension = "";
            int lastDot = fileName.lastIndexOf(".");
            if (lastDot > 0) {
                extension = fileName.substring(lastDot).toLowerCase();
            }
            
            // Tạo tên file sạch cho download (dựa vào extension)
            String downloadName = "file" + extension;
            
            String contentType = "application/octet-stream";
            if (".doc".equals(extension)) {
                contentType = "application/msword";
                downloadName = "bao_cao.doc";
            } else if (".docx".equals(extension)) {
                contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                downloadName = "bao_cao.docx";
            } else if (".pdf".equals(extension)) {
                contentType = "application/pdf";
                downloadName = "bao_cao.pdf";
            } else if (".zip".equals(extension)) {
                contentType = "application/zip";
                downloadName = "source_code.zip";
            } else if (".rar".equals(extension)) {
                contentType = "application/vnd.rar";
                downloadName = "source_code.rar";
            } else if (".7z".equals(extension)) {
                contentType = "application/x-7z-compressed";
                downloadName = "source_code.7z";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + downloadName + "\"; filename*=UTF-8''" + URLEncoder.encode(downloadName, StandardCharsets.UTF_8.name()))
                    .body(resource);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
