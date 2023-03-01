import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class LivedataService{
  //api url'leri tanımlanır.
  private serverUrl:string = "https://localhost:44384/api/Servers/activateserver/";
  private clientUrl:string = "https://localhost:44346/api/Clients/createSockets?clientNumber=";
  
  constructor(private httpClient:HttpClient) { } 

  public OpenServer(){
     return this.httpClient.get(this.serverUrl);
  }

  public OpenSockets(clientNumber:number){
    let url = `${this.clientUrl}${clientNumber}`;
    return  this.httpClient.get(url);
  }
}
