import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';

import {HttpService} from '@core/http.service';
import {EndPoints} from '@shared/end-points';
import {Complaint} from "@shared/models/complaint.model";
import {COMPLAINTS} from "./complaints";
import {log} from "util";

@Injectable({
  providedIn: 'root',
})
export class ComplaintShopService {
  private static SEARCH = '/search';
  private complaints = COMPLAINTS;

  constructor(private httpService: HttpService) {
  }
  //TO DO
  searchAll(): Observable<Complaint[]> {
    this.complaints = this.complaints.filter(c => c.opened === true);
    return of(this.complaints);
    /*return this.httpService
      .get(EndPoints.COMPLAINTS_SHOP + ComplaintShopService.SEARCH);*/
  }

  //TO DO client reply and change status auto
  update(complaint: Complaint): Observable<Complaint> {
    let complaintUpdate = this.complaints.find(c => c.id === complaint.id);
    complaintUpdate.opened = false;
    const i = this.complaints.indexOf(complaintUpdate);
    if(i>=0) {
      this.complaints.splice(i, 1, complaint);
    }
    console.log('ser: '+this.complaints[i].reply)
    return of(complaint);
    /*return this.httpService
      .put(EndPoints.COMPLAINTS, complaint);*/
  }

  read(id: string): Observable<Complaint> {
    return of(this.complaints.find(c => c.id === id));
    /*return this.httpService
      .get(EndPoints.COMPLAINTS + '/' + id);*/
  }

  delete(id: string): Observable<Complaint[]>{
    const i = this.complaints.indexOf(this.complaints.find(c => c.id === id));
    if(i>=0) {
      this.complaints.splice(i, 1);
    }
    return of(this.complaints);
    /*return this.httpService
      .delete(EndPoints.COMPLAINTS + '/' + id );*/
  }
}
