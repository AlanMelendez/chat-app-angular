import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000'); // Cambia esto si tu servidor tiene otra IP o puerto
    this.setupListeners();
  }

  // 📡 Conectar al servidor
  connect(): void {
    this.socket.connect();
    console.log('🔌 Conectado al servidor WebSocket');
  }

  // ❌ Desconectar del servidor
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      console.log('🔌 Desconectado del servidor WebSocket');
    }
  }

  // 📤 Emitir un evento
  sendMessage(event: string, payload: any): void {
    this.socket.emit(event, payload);
  }

  // 📥 Escuchar un evento
  onEvent(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data) => {
        console.log(`📥 Evento recibido: ${event}`, data);
        observer.next(data);
      });
    });
  }


  // 🛠️ Configurar Listeners Básicos
  private setupListeners(): void {
    this.socket.on('connect', () => {
      console.log('✅ Conectado al servidor WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor WebSocket');
    });

    this.socket.on('error', (error: any) => {
      console.error('⚠️ Error en WebSocket:', error);
    });
  }
}
