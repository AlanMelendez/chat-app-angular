import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  sender: 'cliente' | 'mesero' | 'system';
  content: string;
  timestamp: string;
  avatar: string;
  userType: string;
}

interface Mesa {
  id: number;
  unreadMessages: boolean;
}
@Component({
  selector: 'app-mesero',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mesero.component.html',
  styleUrl: './mesero.component.css'
})
export class MeseroComponent implements OnInit, OnDestroy {
  mesas: Mesa[] = [
    { id: 1, unreadMessages: false },
    { id: 2, unreadMessages: true },
    { id: 3, unreadMessages: false }
  ];
  selectedMesaId: number | null = null;
  message: string = '';
  messages: Message[] = [];

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    this.socketService.connect();
    this.socketService.onEvent('newMessage').subscribe((message: any) => {
     console.log('Mensaje recibido', message);
     console.log('Mesa seleccionada', this.selectedMesaId);
      if (message.room === 'mesa_'+this.selectedMesaId && message.remitenteId === 1) {

        this.messages.push({
          sender: message.userType,
          content: message.contenido,
          timestamp: new Date().toLocaleTimeString(),
          avatar: message.userType === 'cliente' ? 'https://alancuevasmelendez.com/img/me-one.png' : 'https://wallpapercave.com/wp/wp2469066.jpg',
          userType: message.userType
        });
        this.scrollToBottom();
      } else {
        const mesa = this.mesas.find((m) => m.id === message.mesaId);
        if (mesa) mesa.unreadMessages = true;
      }

    });
    this.socketService.onEvent('messagesHistory').subscribe((message: any) => {
      console.log('Mensajes anteriores: ', message);

      let messages = message.messages;
      messages.forEach((message: any) => {
        switch(message.userType) {
          case 'cliente':
            this.setMessage(message.contenido, 'cliente');
            break;
          case 'mesero':
            this.setMessage(message.contenido, 'mesero');
            break;
          default:
            this.setMessage(message.contenido, 'system');
            break;

        }
      });

      this.scrollToBottom();
    });
  }

  selectMesa(id: number) {
    this.selectedMesaId = id;
    this.messages = [];
    this.socketService.sendMessage('joinRoom', { mesaId: id });
    const mesa = this.mesas.find((m) => m.id === id);
    if (mesa) mesa.unreadMessages = false;
  }

  sendMessage(): void {
    if (this.message.trim()) {
      let data = {
        mesaId: this.selectedMesaId,
        contenido: this.message
      }
      this.socketService.sendMessage('sendMessage', {
        mesaId: this.selectedMesaId,
        contenido: this.message,
        remitenteId: 2,
        negocioId: 'negocio_45',
        userType: 'mesero'
      });

      this.messages.push({
        sender: 'mesero',
        content: this.message,
        timestamp: new Date().toLocaleTimeString(),
        avatar: 'https://wallpapercave.com/wp/wp2469066.jpg',
        userType: 'mesero'
      });

      this.message = '';
      this.scrollToBottom();
    }
  }
  setMessage(message: string, sender: 'cliente' | 'mesero' | 'system' ) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.messages.push({
      sender: sender,
      content: message,
      timestamp,
      avatar: sender === 'cliente' ? 'https://alancuevasmelendez.com/img/me-one.png' : 'https://wallpapercave.com/wp/wp2469066.jpg',
      userType: sender

    });

    //Clear the input
    this.message = '';
  }
  scrollToBottom() {
    setTimeout(() => {
      const chatBox = document.getElementById('chat-box');
      if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    }, 100);
  }

  enter($event:any) {
    if ($event.key === 'Enter') {
      this.sendMessage();
    }
  }

  disconnect(): void {
    this.socketService.disconnect();
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
