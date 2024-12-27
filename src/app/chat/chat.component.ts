// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-chat',
//   standalone: true,
//   imports: [],
//   templateUrl: './chat.component.html',
//   styleUrl: './chat.component.css'
// })
// export class ChatComponent {

// }

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../services/socket.service';

interface Message {
  sender: 'cliente' | 'mesero';
  content: string;
  timestamp: string;
  avatar: string;
}
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnDestroy {
  message: string = '';
  messages: Message[] = [];

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    // Conectar al WebSocket
    this.socketService.connect();

    this.socketService.sendMessage('joinRoom', { mesaId: 1 });


    this.socketService.onEvent('newMessage').subscribe((message: any) => {
      console.log('Mensaje recibido', message);

      if(message.remitenteId === 2) {
        this.messages.push({
          sender: 'mesero',
          content: message.contenido,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          avatar: 'https://alancuevasmelendez.com/img/me-one.png'
        });
      } else {
        // TODO: Mostrar el mensaje en la interfaz (ESPERANDO RESPUESTA ALGO ASI.)

      }

      this.scrollToBottom();
    });
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  sendMessage(): void {
    if (this.message.trim() === '') return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Enviar el mensaje al servidor
    this.socketService.sendMessage('sendMessage', {
      mesaId: 1,
      contenido: this.message,
      remitenteId: 1,
      negocioId: 'negocio_45'
    });

    // Agregar el mensaje localmente
    this.messages.push({
      sender: 'cliente',
      content: this.message,
      timestamp,
      avatar: 'https://wallpapercave.com/wp/wp2469066.jpg'

    });

    this.message = '';
    this.scrollToBottom();

  }

  scrollToBottom() {
    setTimeout(() => {
      const chatBox = document.getElementById('chat-box');
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }, 100);
  }

}
