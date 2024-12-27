import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Message {
  sender: 'cliente' | 'mesero';
  content: string;
  timestamp: string;
  avatar: string;
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
          sender: 'cliente',
          content: message.contenido,
          timestamp: new Date().toLocaleTimeString(),
          avatar: 'https://wallpapercave.com/wp/wp2469066.jpg'
        });
      } else {
        const mesa = this.mesas.find((m) => m.id === message.mesaId);
        if (mesa) mesa.unreadMessages = true;
      }
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
        negocioId: 'negocio_45'
      });

      this.messages.push({
        sender: 'mesero',
        content: this.message,
        timestamp: new Date().toLocaleTimeString(),
        avatar: 'https://alancuevasmelendez.com/img/me-one.png'
      });

      this.message = '';
    }
  }

  disconnect(): void {
    this.socketService.disconnect();
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
