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
  disp: boolean;
  users: Array<any>;
  requests: Array<any> = [];
  ngOnInit(): void {
    this.socket = io();
    this.disp = true;
    // Displaying Online Users
    this.socket.on('get users', (users) => {
      this.users = users;
    });

    this.socket.on('incoming request', (data) => {
      if (this.requests.indexOf(data) != -1) {
        return ;
      }
      this.requests.push(data);
      console.log(data);
    });

    this.socket.on('validate request', (data) => {
      this.requests.splice(this.requests.indexOf(data), 1);
    });
  }
  // Entering username
  submitUsername(): void {
    this.socket.emit('new user', this.username.trim(),  (data) => {
      if (data) {
        console.log('successful submission');
        this.disp = false;
      }
      else {
        console.log('no submission');
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
}
