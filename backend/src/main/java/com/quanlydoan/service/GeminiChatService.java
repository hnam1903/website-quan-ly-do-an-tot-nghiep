package com.quanlydoan.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quanlydoan.dto.response.ChatbotResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiChatService {

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    private static final String SYSTEM_PROMPT = """
            Bạn là giảng viên đại học có kinh nghiệm hướng dẫn đồ án tốt nghiệp ngành Công nghệ Thông tin.
            Hãy đề xuất 5 đề tài phù hợp với sinh viên đại học.
            Yêu cầu:
            - Có tính thực tế phù hợp với sinh viên đại học làm đồ án tốt nghiệp.          
            - Tên đề tài phải bắt đầu bằng:"Xây dựng", "Nghiên cứu", "Phát triển", "Thiết kế" hoặc "Ứng dụng".
            - Tên đề tài phải mang tính học thuật và phù hợp với đồ án CNTT.
            Mỗi đề tài gồm: tên, 1-2 dòng mô tả, công nghệ, đánh giá ngắn.
            Trả về JSON:
            {"danhSachDeTai":[{"tenDeTai":"...","noiDungDuKien":"...","congNgheSuDung":"...","danhGiaThucTe":"..."}]}
            Chỉ trả JSON, không giải thích.
            """;

    public ChatbotResponse getDeTaiGoiY(String message) {
        try {
            String responseText = chatClient.prompt()
                    .system(SYSTEM_PROMPT)
                    .user("Sinh viên yêu cầu: " + message)
                    .call()
                    .content();

            return parseResponse(responseText);
        } catch (Exception e) {
            log.error("Error calling Gemini API: ", e);
            return ChatbotResponse.builder()
                    .danhSachDeTai(List.of())
                    .tinNhan("Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.")
                    .build();
        }
    }

    private ChatbotResponse parseResponse(String response) {
        try {
            String cleanedResponse = cleanJsonResponse(response);
            return objectMapper.readValue(cleanedResponse, ChatbotResponse.class);
        } catch (JsonProcessingException e) {
            log.error("Error parsing JSON response: ", e);
            log.debug("Raw response: {}", response);
            return ChatbotResponse.builder()
                    .danhSachDeTai(List.of())
                    .tinNhan("Đã xảy ra lỗi khi phân tích kết quả. Vui lòng thử lại.")
                    .build();
        }
    }

    private String cleanJsonResponse(String response) {
        String cleaned = response.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }
}
