import {Component, OnInit, ViewChild} from '@angular/core';
import * as io from 'socket.io-client';
declare var MediaRecorder: any;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

  @ViewChild('myvideo') myVideo: any;
  socket;
  username: string;
  receiver: string;
  disp: boolean;
  showChat: boolean;
  users: Array<any>;
  chunks: Array<any>;
  lol: boolean;
  requests: Array<any> = [];
  n = <any>navigator;
  ngOnInit(): void {
    this.lol = false;
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
      this.n.mediaDevices.getUserMedia({video: true, audio: true }).then((stream) => {
        var mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.onstart = (e) => {
          this.chunks = [];
        };
        mediaRecorder.ondataavailable =  (e) => {
          console.log('is it working?');
          this.chunks.push(e.data);
        };
        mediaRecorder.onstop = (e) => {

          var blob = new Blob(this.chunks, { 'type': 'video/webm;codecs=vp9'});
          var req = {
            receiver : this.receiver,
            vid : blob
          };
          this.socket.emit('video transfer', req);
        };
        mediaRecorder.start();
        setInterval(function() {
          mediaRecorder.stop();
          mediaRecorder.start();
        }, 3000);
      }).catch( function (err) {
        console.log(err);
      });
    });
    this.socket.on('play video', (stream) => {
      var blob = new Blob([stream], { 'type': 'video/webm;codecs=vp9'});
      this.myVideo.nativeElement.src = URL.createObjectURL(blob);
      this.myVideo.nativeElement.play();
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
