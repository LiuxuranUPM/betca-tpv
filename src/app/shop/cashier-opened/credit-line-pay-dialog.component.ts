import {Component, EventEmitter, Inject, Input, Output} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {User} from '../shared/services/models/user.models';
import {Observable, of} from 'rxjs';
import {SharedCreditLineService} from '../shared/services/shared.credit-line.service';
import {Ticket} from '../shared/services/models/ticket.model';


@Component({
  templateUrl: 'credit-line-pay-dialog.component.html'
})

export class CreditLinePayDialogComponent {

  title = 'Unpaid tickets';
  user: User;
  cash = false;
  card = false;

  unpaidTickets: Observable<Ticket[]> = of([]);

  @Input() userPhone: string;
  @Output() add = new EventEmitter<string>();

  constructor(@Inject(MAT_DIALOG_DATA) data, private sharedCreditLineService: SharedCreditLineService) {

  }

  // TODO Extraer a shared lo de buscar usuario cuando vaya
  searchUser(mobile: string): void {
    if (mobile) {
      // TODO falta buscar el user en BD, si no existe, debe sacar un dialogo diciendolo; debe tener linea de credito
      this.user = {mobile: Number(mobile)};
    }
  }

  managedMobile(): boolean {// TODO ? VER SI LO HAGO
    return !!this.user;
  }

  resetMobile(): void {
    this.user = undefined;
  }

  public onSelect(value): void {
    this.add.emit(value);
  }

  searchUnpaidTicketsByUserPhone(): void {
      // TODO falta buscar el user en BD, si no existe, debe sacar un dialogo diciendolo; debe tener linea de credito
      this.user = {mobile: Number(this.userPhone)};
      if (this.user){
        this.unpaidTickets = this.sharedCreditLineService.searchUnpaidTickets(this.user.mobile.toString());
        console.log(this.unpaidTickets);
      }
  }

  payByCash(): void{
    if (this.cash === false) {
      this.cash = true;
      this.card = false;
    } else {
      this.cash = false;
    }
  }

  payByCard(): void{
    if (this.card === false) {
      this.card = true;
      this.cash = false;
    } else {
      this.card = false;
    }
  }

  pay(): void {
    // TODO
  }

}
