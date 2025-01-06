
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { timestamp } from 'rxjs';

interface Message {
  sender: 'cliente' | 'mesero' | 'system';
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
  @ViewChild('messageInput') inputMessage!: ElementRef;
  @Input() mesaId: number = 1;
  @Input() negocioId: number = 2;
  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    // Conectar al WebSocket
    this.socketService.connect();

    this.socketService.sendMessage('joinRoom', { mesaId: this.mesaId });



    this.socketService.onEvent('newMessage').subscribe((message: any) => {
      console.log('Mensaje recibido', message);

      if(message.remitenteId === 2) {

        this.setMessage(message, 'mesero');
      } else {
        // TODO: Mostrar el mensaje en la interfaz (ESPERANDO RESPUESTA ALGO ASI.)

      }

      this.scrollToBottom();
    });

    this.socketService.onEvent('messagesHistory').subscribe((message: any) => {
      console.log('Mensajes anteriores: ', message);

      let messages = message.messages;
      messages.forEach((message: any) => {
        switch(message.userType) {
          case 'cliente':
            this.setMessage(message, 'cliente');
            break;
          case 'mesero':
            this.setMessage(message, 'mesero');
            break;
          default:
            this.setMessage(message, 'system');
            break;

        }
      });

      this.scrollToBottom();
    });
  }
  ngAfterViewInit() {
    this.inputMessage.nativeElement.focus();

  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  sendMessage(): void {
    if (this.message.trim() === '') return;

    const timestamp = new Date(); // Obtiene la fecha completa

    let message = {
      mesaId: this.mesaId,
      contenido: this.message,
      remitenteId: 1,
      negocioId: this.negocioId,
      userType: 'cliente',
      timestamp: timestamp
    }
    // Enviar el mensaje al servidor
    this.socketService.sendMessage('sendMessage', message);

    // Agregar el mensaje localmente
    this.setMessage(message, 'cliente');


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
  setMessage(message: any, sender: 'cliente' | 'mesero' | 'system' ) {

    this.messages.push({
      sender: sender,
      content: message.contenido,
      timestamp: message.timestamp,
      avatar: sender === 'cliente' ? 'https://alancuevasmelendez.com/img/me-one.png' : 'https://wallpapercave.com/wp/wp2469066.jpg'

    });

    //Clear the input
    this.message = '';
  }

  sendNotification() {
    // let message_notification = `🛎️ El mesero ha sido notificado y está en camino.`;

    let message_notification = {
      mesaId: this.mesaId,
      contenido: `🛎️ Solicitud de asistencia en la mesa.`,
      remitenteId: 1,
      negocioId: this.negocioId,
      userType: 'system',
      timestamp: new Date()
    }

    this.setMessage(message_notification, 'system');
      // Enviar el mensaje al servidor
      this.socketService.sendMessage('sendMessage',message_notification );

    this.inputMessage.nativeElement.focus();
  }

  enter($event:any) {
    if ($event.key === 'Enter') {
      this.sendMessage();
    }
  }

}
