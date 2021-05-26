import {Component, Inject} from '@angular/core';

import {TicketCreation} from './ticket-creation.model';
import {ShoppingCartService} from './shopping-cart.service';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ShoppingState} from '../../shared/services/models/shopping-state.model';
import {UserSearch} from '../../users/models/user-search-model';
import {UserCompleteService} from '@shared/services/userComplete.service';
import {DataProtectionActService} from '@shared/components/data-protection-act/data-protection-act.service';
import {AuthService} from '@core/auth.service';
import {UserUpdateCreateDialogComponent} from '../../users/dialog/user-update-create-dialog.component';
import {SharedCreditLineService} from '../../shared/services/shared.credit-line.service';
import {SharedVoucherService} from '../../shared/services/shared-voucher.service';
import {VoucherConsumingComponent} from '../../vouchers/voucher-consuming/voucher-consuming-component';

@Component({
  templateUrl: 'check-out-dialog.component.html',
  styleUrls: ['shopping-cart.component.css']
})
export class CheckOutDialogComponent {
  ticketCreation: TicketCreation;
  totalPurchase: number;
  requestedInvoice = false;
  requestedGiftTicket = false;
  requestedDataProtectionAct = false;
  credit = false;
  checkedCreditLine = false;
  userSearch: UserSearch;
  salespeople: string;
  constructor(@Inject(MAT_DIALOG_DATA) data, private dialog: MatDialog, private dialogRef: MatDialogRef<CheckOutDialogComponent>,
              private shoppingCartService: ShoppingCartService, private userService: UserCompleteService, private authService: AuthService,
              private dataProtectionActService: DataProtectionActService, private sharedCreditLineService: SharedCreditLineService,
              private voucherService: SharedVoucherService) {
    this.ticketCreation = {cash: 0, card: 0, voucher: 0, shoppingList: data, note: ''};
    this.total();
  }

  total(): void {
    this.totalPurchase = 0;
    for (const shopping of this.ticketCreation.shoppingList) {
      this.totalPurchase = this.totalPurchase + shopping.total;
    }
    this.totalPurchase = Math.round(this.totalPurchase * 100) / 100;
  }

  format(value: number): number {
    return value ? value : 0; // empty string,NaN,false,undefined,null,0 is: false
  }

  searchUser(mobile: string): void {

    if (mobile) {

      this.checkMobileExist(Number(mobile));
      this.ticketCreation.user = {mobile: Number(mobile)};
      this.sharedCreditLineService.findByUserReference(this.ticketCreation.user.mobile.toString()).subscribe(
        value => {
          if (value != null) {
            this.credit = true;
          }
        }
      );
    }
  }

  checkMobileExist(mobile: number): void {

    this.userService.searchCompleteUser(Number(mobile)).subscribe(() => console.log('succes'),
      () => {
        console.log('error');
        this.dialog.open(UserUpdateCreateDialogComponent);
      });
  }

  managedMobile(): boolean {
    return !!this.ticketCreation.user;
  }

  resetMobile(): void {
    this.ticketCreation.user = undefined;
    this.credit = false;
    this.checkedCreditLine = false;
  }

  unCommitted(): boolean {
    for (const shopping of this.ticketCreation.shoppingList) {
      if (!shopping.state && shopping.amount > 0) {
        return true;
      }
    }
    return false;
  }

  totalCommitted(): number {
    let total = 0;
    for (const shopping of this.ticketCreation.shoppingList) {
      if (shopping.state) {
        total += shopping.total;
      }
    }
    return Math.round(total * 100) / 100;
  }

  warning(): boolean {
    return !this.managedMobile() && this.unCommitted();
  }

  returnedAmount(): number {
    return Math.round(
      (this.format(this.ticketCreation.cash)
        + this.format(this.ticketCreation.card)
        + this.format(this.ticketCreation.voucher)
        - this.totalPurchase) * 100
    ) / 100;
  }

  returnedCash(): number {
    if (this.ticketCreation.cash >= this.returnedAmount()) {
      return this.returnedAmount();
    } else {
      return this.ticketCreation.cash;
    }
  }

  fillCard(): void {
    if (this.returnedAmount() < 0) {
      this.ticketCreation.card = -this.returnedAmount();
    } else {
      this.ticketCreation.card = this.totalPurchase;
      this.ticketCreation.cash = 0;
    }
  }

  fillCash(): void {
    this.ticketCreation.cash = this.format(this.ticketCreation.cash);
    if (this.returnedAmount() < 0 && this.ticketCreation.cash === 0) {
      this.ticketCreation.cash = -this.returnedAmount();
    } else if (this.ticketCreation.cash < 20) {
      this.ticketCreation.cash = (Math.round(this.ticketCreation.cash / 5) + 1) * 5;
    } else if (this.ticketCreation.cash < 50) {
      this.ticketCreation.cash = (Math.round(this.ticketCreation.cash / 10) + 1) * 10;
    } else {
      this.ticketCreation.cash = (Math.round(this.ticketCreation.cash / 50) + 1) * 50;
    }
  }

  consumeVoucher(): void {
    this.voucherService.findAll().subscribe(
      (v) => {
        const unConsumedVouchers = v.filter(vs => vs.dateOfUse === undefined);
        this.dialog.open(VoucherConsumingComponent, {data: unConsumedVouchers})
          .afterClosed()
          .subscribe((totalValue) => {
            this.ticketCreation.voucher += totalValue;
          });
      }
    );
  }

  invalidCheckOut(): boolean {
    if (!this.checkedCreditLine) {
      return (this.totalPurchase + this.returnedAmount() - this.totalCommitted() < -0.01); // rounding errors
    }
    return false;
  }

  round(value): any {
    return Math.round(value * 100) / 100;
  }

  pay(): any {
    const returned = this.returnedAmount();
    const userName: string = this.authService.getName();
    const cash = this.ticketCreation.cash;
    let voucher = 0;
    this.ticketCreation.cash = this.format(this.ticketCreation.cash);
    this.ticketCreation.card = this.format(this.ticketCreation.card);
    this.ticketCreation.voucher = this.format(this.ticketCreation.voucher);
    if (returned > 0) {
      this.ticketCreation.cash -= returned;
    }
    if (this.ticketCreation.cash < 0) {
      voucher = -this.ticketCreation.cash;
      this.ticketCreation.cash = 0;
    }
    if (this.ticketCreation.card > 0) {
      this.ticketCreation.note += ' Pay with card: ' + this.round(this.ticketCreation.card) + '.';
    }
    if (this.ticketCreation.voucher > 0) {
      this.ticketCreation.note += ' Pay with voucher: ' + this.round(this.ticketCreation.voucher) + '.';
    }
    if (this.ticketCreation.cash > 0) {
      this.ticketCreation.note += ' Pay with cash: ' + this.round(cash) + '.';
    }
    if (!this.ticketCreation.note) {
      this.ticketCreation.note += ' No Pay.';
    }

    this.ticketCreation.note += ' Salespeople is ' + userName;
    if (returned > 0) {
      this.ticketCreation.note += ' Return: ' + this.round(returned) + '.';
    }
    // tslint:disable-next-line:max-line-length
    this.shoppingCartService.createTicketAndPrintReceipts(this.ticketCreation, voucher, this.requestedInvoice, this.requestedGiftTicket, this.requestedDataProtectionAct, this.checkedCreditLine)
      .subscribe(() => this.dialogRef.close(true));
  }

  invalidInvoice(): boolean {
    // TODO pendiente de calcular. Hace falta tener al usuario totalmente completado
    return !this.ticketCreation.user;
  }

  useCreditLine(): void {
    if (this.checkedCreditLine) {
      this.checkedCreditLine = false;
    } else {
      this.checkedCreditLine = true;
      this.ticketCreation.cash = 0;
      this.ticketCreation.card = 0;
      this.ticketCreation.shoppingList.forEach((value) => {
        value.state = ShoppingState.COMMITTED;
      });
    }
  }

}
