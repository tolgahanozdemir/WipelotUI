import { Component, OnDestroy, OnInit } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import * as Highcharts from 'highcharts';
import { Subscription } from 'rxjs';
import { ClientSocket } from '../models/clientSockets';
import { LivedataService } from '../services/livedata.service';

@Component({
  selector: 'app-content-wrapper',
  templateUrl: './content-wrapper.component.html',
  styleUrls: ['./content-wrapper.component.css'],
})
export class ContentWrapperComponent{
  connection: signalR.HubConnection;
  reconnectTimeValues: Array<number> = [1000, 1000, 2000, 4000];
  averageNumbers: Array<number> = [];
  messages: Array<ClientSocket> = [];
  clientNumber: number = 0;
  ajaxForServer!: Subscription;
  ajaxForClient!: Subscription;
  temp = 0;
  standardDeviation=0;
  
  getClientNumber(userInput: any) {
    this.clientNumber = userInput.clientNumber;
    
    this.ajaxForClient = this.livedataService.OpenSockets(userInput.clientNumber).subscribe();
    this.ajaxForServer = this.livedataService.OpenServer().subscribe();
  }

  constructor(private livedataService: LivedataService) {
    //linkte verilen bağlantıya bağlanır.
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44300/wipelothub')
      .withAutomaticReconnect(this.reconnectTimeValues) //bağlantı koptuktan sonra verilen listedeki sürelerle bağlanmayı dener
      .build();

    //İlk açılışta yukarıdaki linke bağlanamama durumunda belirtilen süre aralığında bağlanma isteği gönderir.
    const start = async () => {
      try {
        await this.connection.start();
      } catch {
        setTimeout(() => start(), 2000);
      }
    };

    start();
    var sumOfSquares = 0;

    //SignalR'dan gelen verileri alarak grafiğe ekleme işlemini gerçekleştirir.
    this.connection.on('messageReceived', (message) => {
      this.messages.push(message);
      console.log(message);
      if (this.temp < this.clientNumber) {
        //veri aktarımı başladığında ilk önce açılan soket sayısı kadar olan değerler için
        this.chartForLiveData.addSeries({
          name: message.uniqueNumber,
          type: 'line',
          data: [[message.timeStamp, message.randomValue]],
        });
        this.chartForAverageData.addSeries({
          name: message.uniqueNumber,
          type: 'line',
          data: [[message.timeStamp, message.randomValue]],
        });
        this.chartForStandardDeviationData.addSeries({
          name: message.uniqueNumber,
          type: 'line',
          data: [[message.timeStamp, 0]],
        });
        this.averageNumbers.push(message.randomValue);

        this.temp++;
      }

      if (this.temp >= this.clientNumber) {
        //soket sayısı kadar kayıt oluştuktan sonra bu kayıtlara ekleme yapmak için.
        for (let i = 0; i < this.clientNumber; i++) {
          if (message.uniqueNumber == i + 1) {
            const series = this.chartForLiveData.series[i];
            var shift = series.data.length > 15;
            this.chartForLiveData.series[i].addPoint(
              [message.timeStamp, message.randomValue],
              true,
              shift
            );

            //Ortalamayı hesaplar ve tabloya ekler
            this.averageNumbers[i] =(this.averageNumbers[i] * message.timeStamp +message.randomValue) /(message.timeStamp + 1);
            this.chartForAverageData.series[i].addPoint([message.timeStamp, this.averageNumbers[i]],true,shift);

            //standart sapmayı hesaplar
            let serie = this.messages.filter((x) => x.uniqueNumber == i + 1);
            serie.forEach((element) => {sumOfSquares += Math.pow(element.randomValue - this.averageNumbers[i],2);});
            this.standardDeviation = Math.sqrt(sumOfSquares / message.timeStamp);

            this.chartForStandardDeviationData.series[i].addPoint([message.timeStamp, this.standardDeviation],true,shift);
            sumOfSquares = 0;
          }
        }
      }
      this.updateFromInput = true;
    });

    const self = this;
    this.chartCallbackForLiveData = (chart: any) => {self.chartForLiveData = chart;};
    this.chartCallbackForAverageData = (chart: any) => {self.chartForAverageData = chart;};
    this.chartCallbackForStandardDeviation = (chart: any) => {self.chartForStandardDeviationData = chart;};
  }

  chartForLiveData: any;
  chartForAverageData: any;
  chartForStandardDeviationData: any;
  updateFromInput = false;
  chartCallbackForLiveData: any;
  chartCallbackForAverageData: any;
  chartCallbackForStandardDeviation: any;
  Highcharts: typeof Highcharts = Highcharts;
  liveDataChartOptions: Highcharts.Options = {
    title: {
      text: 'CANLI VERİ',
    },
    yAxis: {
      title: {
        text: 'Y Ekseni',
      },
    },
    xAxis: {
      accessibility: {
        rangeDescription: '0-30',
      },
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
    },
    series: [],
  };
  averageDataChartOptions: Highcharts.Options = {
    title: {
      text: 'ORTALAMA',
    },
    yAxis: {
      title: {
        text: 'Y Ekseni',
      },
    },
    xAxis: {
      accessibility: {
        rangeDescription: '0-30',
      },
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
    },
    series: [],
  };
  standardDeviationChartOptions: Highcharts.Options = {
    title: {
      text: 'Standart Sapma',
    },
    yAxis: {
      title: {
        text: 'Y Ekseni',
      },
    },
    xAxis: {
      accessibility: {
        rangeDescription: '0-30',
      },
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
    },
    series: [],
  };
}
