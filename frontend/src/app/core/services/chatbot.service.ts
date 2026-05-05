import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants/api.constants';

export interface ChatMessage {
  message: string;
}

export interface DeTaiGoiY {
  tenDeTai: string;
  noiDungDuKien: string;
  congNgheSuDung: string;
  danhGiaThucTe: string;
}

export interface ChatbotResponse {
  danhSachDeTai: DeTaiGoiY[];
  tinNhan: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiUrl = `${API_URL}/chatbot`;

  constructor(private http: HttpClient) {}

  goiYDeTai(message: string): Observable<ChatbotResponse> {
    return this.http.post<ChatbotResponse>(`${this.apiUrl}/goi-y-de-tai`, { message });
  }
}
