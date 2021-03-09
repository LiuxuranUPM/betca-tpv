import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

import {HttpService} from '@core/http.service';
import {TicketCreditLine} from './models/ticket-credit-line.model';
import {Credit} from './models/credit.model';
import {EndPoints} from '@shared/end-points';
import {CreditSale} from './models/credit-sale.model';

@Injectable({
  providedIn: 'root',
})
export class SharedCreditLineService {
  private SEARCH = '/search';
  private SEARCH_UNPAID = '/searchUnpaid';

  constructor(private httpService: HttpService) {
  }

  findByUserReference(userReference: string): Observable<Credit> {
    return this.httpService
      .get(EndPoints.CREDIT + this.SEARCH + '?userReference=' + userReference);
  }

  create(credit: Credit): Observable<Credit> {
    return this.httpService
      .post(EndPoints.CREDIT, credit);
  }

  addCreditSale(userReference: string, creditSale: CreditSale): Observable<Credit>{
    return this.httpService
      .put(EndPoints.CREDIT + '/' + userReference, creditSale);
  }

  findUnpaidTicketsFromCreditLine(userReference: string): Observable<TicketCreditLine[]> {
    return this.httpService
      .get(EndPoints.CREDIT + this.SEARCH_UNPAID + '?userReference=' + userReference);
  }

  /*searchUnpaidTickets(userPhone: string): Observable<TicketCreditLine[]> {
    return of([
      {reference: '4354345df', total: 25, creationDate: '2018-02-27 12:26:30'},
      {reference: '7354345df', total: 40, creationDate: '2018-03-09 10:20:35'},
      {reference: '6354345df', total: 68, creationDate: '2018-03-12 12:09:12'},
    ]);
  }*/

}
