import {Injectable} from '@angular/core';

import {Observable, of} from 'rxjs';
import {HttpService} from '@core/http.service';
import {InvoiceSearch} from './invoice-search.model';
import {Invoice} from '../shared/services/models/invoice';
import {InvoiceItem} from './invoice-item.model';

import {Ticket} from '../shared/services/models/ticket.model';
import {User} from './invoice-user';
import {InvoiceUpdate} from './invoice-update.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  phones: number[] = [651112230, 651112231, 651112232];
  invoicesItems: InvoiceItem[] = [{number: 111200300, creationDate: new Date(), baseTax: 1, taxValue: 1, phone: this.phones[0]},
    {number: 111200301, creationDate: new Date(), baseTax: 1, taxValue: 1, phone: this.phones[1]},
    {number: 111200302, creationDate: new Date(), baseTax: 1, taxValue: 1, phone: this.phones[2]}];

  users: User[] = [{phone: this.phones[0], dni: 'DNI_U1', name: 'User_1', familyName: 'FamU_1'},
    {phone: this.phones[1], dni: 'DNI_U2', name: 'User_2', familyName: 'FamU_2'},
    {phone: this.phones[2], dni: 'DNI_U3', name: 'User_3', familyName: 'FamU_3'}];

  tickets: Ticket[] = [{id: 'Ticket_0', mobile: this.phones[0], reference: 'Tck_Ref_0'},
    {id: 'Ticket_1', mobile: this.phones[1], reference: 'Tck_Ref_1'},
    {id: 'Ticket_2', mobile: this.phones[2], reference: 'Tck_Ref_2'}];

  invoices: Invoice[] = [{
    number: 111200300, creationDate: new Date(), baseTax: 1, taxValue: 1,
    user: this.users[0], ticket: this.tickets[0]
  },
    {
      number: 111200301, creationDate: new Date(), baseTax: 1, taxValue: 1,
      user: this.users[1], ticket: this.tickets[1]
    },
    {
      number: 111200302, creationDate: new Date(), baseTax: 1, taxValue: 1,
      user: this.users[2], ticket: this.tickets[2]
    }];

  constructor(private httpService: HttpService) {
  }

  search(invoiceSearch: InvoiceSearch): Observable<InvoiceItem[]> {
    console.log('Filtrando resultados por invoiceSearch');
    console.log(invoiceSearch);
    const invoices: InvoiceItem[] = this.invoicesItems.filter(invo => invoiceSearch.phone === undefined ||
      invo.phone === invoiceSearch.phone)
      .filter(invo => invoiceSearch.ticketId === undefined ||
        invo.number === invoiceSearch.ticketId);
    return of(invoices);
  }

  printPdf(numberInvoice: number): Observable<void> {
    return of(console.log('Implementado'));
  }

  read(numberInvoice: number): Observable<Invoice> {
    const invoice: Invoice = this.invoices.find(invo => invo.number === numberInvoice);
    console.log(invoice);
    return of(invoice);
  }

  update(invoice: InvoiceUpdate): Observable<InvoiceItem> {
    const invoiceUpdated: InvoiceItem = this.invoicesItems.find(invo => invo.number === invoice.number);
    const invoiceFullUpdated: Invoice = this.invoices.find(invo => invo.number === invoice.number);

    invoiceFullUpdated.user.dni = invoice.dniUser;
    invoiceFullUpdated.user.name = invoice.nameUser;
    invoiceFullUpdated.user.familyName = invoice.familyNameUser;
    invoiceFullUpdated.user.phone = invoice.phoneUser;
    invoiceUpdated.phone = invoice.phoneUser;
    return of(invoiceUpdated);
  }
}