import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-dummy',
  templateUrl: './dummy.component.html',
  styleUrls: ['./dummy.component.css']
})
export class DummyComponent implements OnInit {

  constructor() { }

  receivedMsg = [];
  tobeSentMsg = 0;
  amqpclient = require('rhea');
  amqpsender = null;
  @ViewChild('chart') el: ElementRef;

  ngOnInit() {
    // connecting to AMQ Broker
    const server = 'ws://localhost:5672';
    this.amqpclient.on('message', this.onMsg.bind(this));
    const ws = this.amqpclient.websocket_connect(WebSocket);
    const connection = this.amqpclient.connect({ 'connection_details': ws(server, ['binary', 'AMQPWSB10', 'amqp']), 'reconnect': true });
    connection.open_receiver('examples');
    this.amqpsender = connection.open_sender('examples');

    // initialize a chart
    this.basicChart();
  }

  // When a messages arrives
  onMsg(context) {

    // Log message in the console
    console.log(context.message.body);

    // update data in the angular app
    this.receivedMsg.push(context.message.body);
    if (this.receivedMsg.length > 20) {
      this.receivedMsg.shift();
    }
    Plotly.update(this.el.nativeElement, {
      y: [this.receivedMsg]
    });

  }

  sendMsg() {
    this.amqpsender.send({ 'body': this.tobeSentMsg });
  }

  basicChart() {
    const element = this.el.nativeElement;

    const style = {
      margin: { t: 0 }
    };
    const data = [{
      y: [0]
    }];
    Plotly.plot(element, data, style);
  }

}
