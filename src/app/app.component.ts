import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GoogleService, GoogleObj } from './google.services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [GoogleService]
})
@Injectable()
export class AppComponent {
  data: string = '{';
  palabra;
  k;
  folders;
  traduccion;

  public googleObj: GoogleObj = new GoogleObj();
  public key: string = 'AIzaSyD93SQumJJeCbu92UAIQHr0BUQNRQus-T8';
  public result = ''

  constructor(private httpClient: HttpClient,private _google: GoogleService){}

  fileContent: string = "";

  public onChange(fileList: FileList): void {
    var files;
    let file = fileList[0];

    let fileReader: FileReader = new FileReader();
    fileReader.onloadend = function (x) {
      var lines;
      files = fileReader.result;

      localStorage.setItem("Arreglo", files);  //JSON.stringify(lines) 
    }
    fileReader.readAsText(file);
  }

  async read() {
    this.folders = localStorage.getItem('Arreglo').split('\n');
    this.k = 0; 
    for (let i of localStorage.getItem("Arreglo").split("\n")) {
      var j = i.split('Proyect\\'); 
      var ruta = 'http://localhost/' + j[1];      
      
      if (j[1]) {
        await this.httpClient.get(ruta).subscribe(res => {}, 
          error => {
          this.ProcesarHTML(error.error.text);
          this.k++;
        });
 
      }
    }
  }
  
 async  ProcesarHTML(Str: string) {

    this.folders[this.k] = this.folders[this.k].substring(this.folders[this.k].indexOf('src')).replace(/.html/,'');
    for (let i = 0; i < Str.length; i++){

      var axStr = Str.substring(i);
      var etiqueta = null;

     if (axStr[0] == '<' && axStr[1] != '/'){
       var final = axStr.indexOf('>');
       var final2 = axStr.indexOf(' ');

       if (final < final2)
         etiqueta = axStr.substring(1,axStr.indexOf('>'));
       else
         etiqueta = axStr.substring(1,axStr.indexOf(' '));
     }

      if (etiqueta){
       if (etiqueta == 'style'){
         var eliminar = axStr.substring(axStr.indexOf('>')+1, axStr.indexOf('/'+etiqueta)-1);
         axStr = axStr.replace(eliminar,'');
       }
       var axStr2 = axStr.substring(axStr.indexOf('>')+1).trim();

       if (axStr.indexOf('/'+etiqueta) && axStr2[0]!='<'){

         this.palabra = axStr2.substring(0,axStr2.indexOf('<'));
         this.googleObj.q = this.palabra;
         console.log(this.palabra);

         await this.traducir();
         console.log(this.traduccion);

         var key = '\n   "app.'+ etiqueta +'.'+this.palabra +'": "'+ this.traduccion +'",';
         //console.log(etiqueta, key);
         //this.crearJSON();
        }
      }
    }
    //this.k++;
  }

  async traducir() {
    this.traduccion = await this._google.translate(this.googleObj, this.key).toPromise();
    this.traduccion = this.traduccion.data.translations[0].translatedText;
    //console.log(this.traduccion);
  }

  async crearJSON(){
    
    var key = '\n   "app.'+this.folders[this.k]+'.'+this.palabra+'": "'+ this.traduccion+'",';
    console.log(key);
    
    
      // key += this.traduccion+'",';

      // var theJSON = JSON.stringify(theData);
      // var uri = "data:application/json;charset=UTF-8," + encodeURIComponent(theJSON);
      
      // var a = document.createElement('a');
      // a.href = uri;
      // a.innerHTML = "Right-click and choose 'save as...'";
      // document.body.appendChild(a);
   
  }
}
