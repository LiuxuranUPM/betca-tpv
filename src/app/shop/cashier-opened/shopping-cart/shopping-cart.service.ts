import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {EMPTY, iif, merge, Observable} from 'rxjs';
import {catchError, concatMap, map} from 'rxjs/operators';

import {HttpService} from '@core/http.service';
import {SharedArticleService} from '../../shared/services/shared.article.service';
import {Shopping} from '../../shared/services/models/shopping.model';
import {TicketCreation} from './ticket-creation.model';
import {ArticleQuickCreationDialogComponent} from './article-quick-creation-dialog.component';

import {ShoppingState} from '../../shared/services/models/shopping-state.model';
import {EndPoints} from '@shared/end-points';
import {SharedOfferService} from '../../shared/services/shared.offer.service';
import {BudgetCreation} from '../../budgets/budget-creation.model';
import {CreditSale} from '../../shared/services/models/credit-sale.model';
import {BudgetService} from '../../budgets/budget.service';
import {SharedCreditLineService} from '../../shared/services/shared.credit-line.service';
import {SharedCreditSaleService} from '../../shared/services/shared.credit-sale.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {User} from '@core/user.model';
import {Offer} from '../../shared/services/models/offer.model';
import {SharedVoucherService} from '../../shared/services/shared-voucher.service';
import {CustomerDiscount} from '../../shared/services/models/customer-discount.model';
import {DataProtectionActService} from '@shared/components/data-protection-act/data-protection-act.service';
import {RgpdType} from '@shared/models/RgpdType';
import {tick} from '@angular/core/testing';

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  static RECEIPT = '/receipt';
  static VARIOUS_BARCODE = '1';
  static VARIOUS_LENGTH = 5;
  private static SEARCH = '/search';
  static ticket: any = {};

  creditSale: CreditSale;
  user: User;

  constructor(private dialog: MatDialog, private articleService: SharedArticleService,
              private offerService: SharedOfferService, private httpService: HttpService,
              private budgetService: BudgetService, private sharedCreditLineService: SharedCreditLineService,
              private sharedCreditSaleService: SharedCreditSaleService, private snackBar: MatSnackBar,
              private sharedVoucherService: SharedVoucherService, private dataProtectionActService: DataProtectionActService) {
  }

  read(newBarcode: string): Observable<Shopping> {
    const price: number = Number(newBarcode.replace(',', '.'));
    if (!Number.isNaN(price) && newBarcode.length <= ShoppingCartService.VARIOUS_LENGTH) {
      newBarcode = ShoppingCartService.VARIOUS_BARCODE;
    }
    return this.articleService
      .read(newBarcode)
      .pipe(
        map(article => {
          if (newBarcode === ShoppingCartService.VARIOUS_BARCODE) {
            article.retailPrice = price;
          }
          return article;
        }),
        catchError(() => {
          return this.dialog
            .open(ArticleQuickCreationDialogComponent, {data: {barcode: newBarcode}})
            .afterClosed();
        })
      ).pipe(
        map(article => {
            const shopping = new Shopping(article.barcode, article.description, article.retailPrice);
            if (article.stock < 1) {
              shopping.state = ShoppingState.NOT_COMMITTED;
            }
            return shopping;
          }
        )
      );
  }

  createTicketAndPrintReceipts(ticketCreation: TicketCreation, voucher: number, requestedInvoice: boolean, requestedGiftTicket: boolean,
                               requestDataProtectionAct: boolean, checkedCreditLine: boolean): Observable<void> {
    return this.httpService
      .post(EndPoints.TICKETS, ticketCreation)
      .pipe(
        concatMap(ticket => {
          ShoppingCartService.ticket = ticket;
          this.httpService
            .post(EndPoints.TICKETS + '/', ticketCreation)
            .pipe(

            );
          let receipts = this.printTicket(ticket.id);
          receipts = iif(() => voucher > 0, merge(receipts, this.createVoucherAndPrint(voucher)), receipts);
          receipts = iif(() => requestedInvoice, merge(receipts, this.createInvoiceAndPrint(ticket.reference)), receipts);
          receipts = iif(() => requestedGiftTicket, merge(receipts, this.createGiftTicketAndPrint(ticket.id)), receipts);
          receipts = iif(() => requestDataProtectionAct, merge(receipts, this.createDataProtectionActAndPrint()), receipts);
          receipts = iif(() => checkedCreditLine, merge(receipts, this.createCreditSaleAndPrint(ticket.reference,
            ticketCreation.user)), receipts);
          return receipts;
        })// ,switchMap(() => EMPTY)
      );
  }

  printTicket(ticketId: string): Observable<void> {
    return this.httpService.pdf().get(EndPoints.TICKETS + '/' + ticketId + ShoppingCartService.RECEIPT)
      .pipe(
        concatMap(ticket => {
          const receipts = this.ForSalespeople();
          return receipts;
        })
      );
  }

  ForSalespeople(): Observable<void> {
    console.log(ShoppingCartService.ticket);
    const obj: any = {};
    const ticket = ShoppingCartService.ticket;
    obj.salesperson = ticket.note.substring(ticket.note.lastIndexOf(' ') + 1, ticket.note.length);
    obj.salesDate = this.SalesGetDate();
    obj.ticketBarcode = ticket.id;
    obj.articleBarcode = [];
    obj.amount = 0;
    obj.total = 0;
    ticket.shoppingList.map((item) => {
      obj.total += item.retailPrice;
      obj.amount += item.amount;
      obj.articleBarcode.push(item.barcode);
    });
    console.log(obj);
    return this.httpService.post(EndPoints.SALE_PEOPLE, obj);
  }

  createVoucherAndPrint(voucher: number): Observable<void> {
    return this.sharedVoucherService.printVoucher(voucher);
  }

  createInvoiceAndPrint(ticketId: string): Observable<void> {
    // return this.httpService.pdf().get(EndPoints.INVOICES + '/' + ticketId + ShoppingCartService.RECEIPT);
    const ticket = {reference: ticketId}; // invoice provisional
    return this.httpService.pdf().post(EndPoints.INVOICES, ticket);
  }

  createGiftTicketAndPrint(ticketId: string): Observable<void> {
    const giftTicket = {message: 'Gift ticket from MIW', ticketId}; // ticket provisional
    return this.httpService
      .post(EndPoints.GIFTTICKETS, giftTicket)
      .pipe(
        concatMap(ticket => {
          const receipts = this.httpService.pdf().get(EndPoints.GIFTTICKETS + '/' + ticket.id + ShoppingCartService.RECEIPT);
          return receipts;
        })
      );
  }

  createDataProtectionActAndPrint(): Observable<void> {
    return this.dataProtectionActService.printUnsignedAgreement('', RgpdType.BASIC);
  }

  createCreditSaleAndPrint(ticketReference, userReference): Observable<any> {
    this.user = userReference;
    this.creditSale = {ticketReference: ticketReference.toString(), payed: false};
    this.addCreditSaleToCreditLine();
    return EMPTY;
  }

  addCreditSaleToCreditLine(): void {
    if (this.user !== undefined) {
      this.sharedCreditSaleService.create(this.creditSale).subscribe(
        result => {
          this.sharedCreditLineService.addCreditSale(this.user.mobile.toString(), result).subscribe(
            value1 => {
              this.snackBar.open('Added to the credit-sales of the user.', 'Close', {
                duration: 3000
              });
            }
          );
        }
      );
    }
  }

  readOffer(offerReference: string): Observable<Offer> {
    return this.offerService
      .read(offerReference);
  }

  createBudget(budgetCreation: BudgetCreation): Observable<void> {
    return this.httpService
      .post(EndPoints.BUDGETS, budgetCreation)
      .pipe(
        concatMap(budget => {
          const receipt = this.printBudget(budget.id);
          return receipt;
        })
      );
  }

  printBudget(BudgetId: string): Observable<void> {
    return this.httpService.pdf().get(EndPoints.BUDGETS + '/' + BudgetId + ShoppingCartService.RECEIPT);
  }

  readBudget(id: string): Observable<BudgetCreation> {
    return this.budgetService
      .read(id);
  }

  addDiscount(mobile: string): Observable<CustomerDiscount[]> {
    return this.httpService
      .paramsFrom({user: mobile})
      .get(EndPoints.CUSTOMERS_DISCOUNTS + ShoppingCartService.SEARCH);
  }

  SalesGetDate(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = change(d.getMonth() + 1);
    const day = change(d.getDate());

    function change(t: any): any {
      if (t < 10) {
        return '0' + t;
      } else {
        return t;
      }
    }

    const time = year + '-' + month + '-' + day;
    return time;
  }
}
