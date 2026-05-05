package com.quanlydoan.controller;

import com.quanlydoan.dto.request.ChatbotRequest;
import com.quanlydoan.dto.response.ChatbotResponse;
import com.quanlydoan.service.GeminiChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final GeminiChatService geminiChatService;

    @PostMapping("/goi-y-de-tai")
    public ResponseEntity<ChatbotResponse> goiYDeTai(@Valid @RequestBody ChatbotRequest request) {
        ChatbotResponse response = geminiChatService.getDeTaiGoiY(request.getMessage());
        return ResponseEntity.ok(response);
    }
}
