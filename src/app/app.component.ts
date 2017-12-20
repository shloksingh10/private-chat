import {Component, OnInit} from '@angular/core';
import * as io from 'socket.io-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  socket;
  username: string;
  receiver: string;
  disp: boolean;
  showChat: boolean;
  users: Array<any>;
  requests: Array<any> = [];
  ngOnInit(): void {
    this.socket = io();
    this.disp = true;
    this.showChat = false;
    // Displaying Online Users
    this.socket.on('get users', (users) => {
      this.users = users;
    });

    this.socket.on('incoming request', (data) => {
      if (this.requests.indexOf(data) != -1) {
        return ;
      }
      this.requests.push(data);
    });

    this.socket.on('validate request', (data) => {
      this.requests.splice(this.requests.indexOf(data), 1);
    });
    // Displaying chat box
    this.socket.on('show chat', (data) => {
      this.receiver = data;
      this.showChat = true;
    });
  }
  // Entering username
  submitUsername(): void {
    this.socket.emit('new user', this.username.trim(),  (data) => {
      if (data) {
        this.disp = false;
      }
    });
  }
  // Sending Request to Connect
  settingUpRequest(receive): void {
    var req = {
      send : this.username,
      receive : receive
    };
    this.socket.emit('send request', req);
  }
  deletingRequest(request): void {
    this.requests.splice(this.requests.indexOf(request), 1);
  }
  acceptingRequest(person2): void {
    var req = {
      user1: this.username,
      user2: person2
    };
    console.log(req.user1);
    console.log(req.user2);
    this.socket.emit('accept request', req);
  }
}
