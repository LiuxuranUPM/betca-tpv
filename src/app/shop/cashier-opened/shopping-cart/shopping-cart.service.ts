import {Injectable} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {EMPTY, iif, merge, Observable, of} from 'rxjs';
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
import {OfferShoppingCart} from './offer-shopping-cart.model';
import {CreditSale} from '../../shared/services/models/credit-sale.model';
import {BudgetService} from '../../budgets/budget.service';
import {SharedCreditLineService} from '../../shared/services/shared.credit-line.service';
import {SharedCreditSaleService} from '../../shared/services/shared.credit-sale.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ShoppingCartService {
  static RECEIPT = '/receipt';
  static VARIOUS_BARCODE = '1';
  static VARIOUS_LENGTH = 5;

  creditSale: CreditSale;

  constructor(private dialog: MatDialog, private articleService: SharedArticleService,
              private offerService: SharedOfferService, private httpService: HttpService,
              private budgetService: BudgetService, private sharedCreditLineService: SharedCreditLineService,
              private sharedCreditSaleService: SharedCreditSaleService, private snackBar: MatSnackBar) {
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
          let receipts = this.printTicket(ticket.id);
          receipts = iif(() => voucher > 0, merge(receipts, this.createVoucherAndPrint(voucher)), receipts);
          receipts = iif(() => requestedInvoice, merge(receipts, this.createInvoiceAndPrint(ticket.id)), receipts);
          receipts = iif(() => requestedGiftTicket, merge(receipts, this.createGiftTicketAndPrint(ticket.id)), receipts);
          receipts = iif(() => requestDataProtectionAct, merge(receipts, this.createDataProtectionActAndPrint(ticket)), receipts);
          receipts = iif(() => checkedCreditLine, merge(receipts, this.createCreditSaleAndPrint(ticket.reference,
            ticketCreation.user.mobile)), receipts);
          return receipts;
        })// ,switchMap(() => EMPTY)
      );
  }

  printTicket(ticketId: string): Observable<void> {
    return this.httpService.pdf().get(EndPoints.TICKETS + '/' + ticketId + ShoppingCartService.RECEIPT);
  }

  createVoucherAndPrint(voucher: number): Observable<void> {
    return EMPTY; // TODO change EMPTY
  }

  createInvoiceAndPrint(ticketId: string): Observable<void> {
    // return this.httpService.pdf().get(EndPoints.INVOICES + '/' + ticketId + ShoppingCartService.RECEIPT);
    const ticket = { id: 'Ma35Mhdgd2454656', message: 'Invoice ticket', ticketId}; // invoice provisional
    return of(ticket)
      .pipe(
        source => {
          return this.printTicket(ticketId);
        }
      );
  }

  createGiftTicketAndPrint(ticketId: string): Observable<void> {
    const giftTicket = { id: 'Ma35Mhdgd2454656', message: 'Gift ticket', ticketId}; // ticket provisional
    return of(giftTicket)
      .pipe(
        source => {
          return this.printTicket(ticketId);
        }
      );
  }

  createDataProtectionActAndPrint(ticket): Observable<void> {
    return EMPTY; // TODO change EMPTY
  }

  createCreditSaleAndPrint(ticketReference, userReference): Observable<any> {
    this.creditSale = {ticketReference: ticketReference.toString(), payed: false};
    this.addCreditSaleToCreditLine(userReference);
    return EMPTY;
  }

  addCreditSaleToCreditLine(userReference): void {
    this.sharedCreditSaleService.create(this.creditSale).subscribe(
      result => {
        this.sharedCreditLineService.addCreditSale(userReference, result).subscribe(
          value1 => {
            this.snackBar.open('Added to the credit-sales of the user.', 'Close', {
              duration: 3000
            });
          }
        );
      }
    );
  }

  readOffer(offerReference: string): Observable<OfferShoppingCart> {
    return this.offerService
      .read(offerReference);
  }

  createBudget(budgetCreation: BudgetCreation): Observable<void> {
    return of(console.log('Success'));
  }
  readBudget(budget: string): Observable<Shopping> {
    return this.budgetService
      .read(budget);
  }

  addDiscount(mobile: string, purchase: number): Observable<number> {
    // TODO Search user mobile to get discount and check minimum purchase
    const minimumPurchase = 60;
    const discount = 50;
    if (purchase < minimumPurchase) {
      return of(0);
    } else {
      return of(discount);
    }
  }
}
