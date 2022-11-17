import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }
  authToken: any;

  getToken() {
    if (this.authToken) return this.authToken;
    else {
      let token = localStorage.getItem('userToken');
      if (token === null) return '';
      else return token;
    }
  }

  setHeaders() {
    let header = new HttpHeaders();
    header = header.set('Authorization', `Bearer ${this.getToken()}`);
    return header;
  }

  imageUpload(url:any, data:any): Observable<any> {
    return this.http.post(url, data);
  }

  post(url:any, data:any): Observable<any> {
    return this.http.post(url, data, { headers: this.setHeaders() });
  }
  delete(url:any, data:any): Observable<any> {
    // options = {...options, ...{ headers: this.setHeaders()}}
    return this.http.request('delete', url, { body: data})
  }

  get(url:any): Observable<any> {
    return this.http.get(url);
  }

  vendorImageUpload(url:any, data:any, options: {}): Observable<any> {
    return this.http.post(url, data, options);
  }

  bulkImageUpload(url:any, data:any, options:any): Observable<any> {
    options = {...options, ...{ headers: this.setHeaders()}}
    return this.http.post(url, data, options);
  }
}
