import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';

import {ShoppingCartService} from './shopping-cart.service';
import {Shopping} from './shopping.model';
import {CheckOutDialogComponent} from './check-out-dialog.component';
import {MatTableDataSource} from '@angular/material/table';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-shopping-cart',
  styleUrls: ['shopping-cart.component.css'],
  templateUrl: 'shopping-cart.component.html'
})
export class ShoppingCartComponent implements OnInit, OnDestroy {

  displayedColumns = ['id', 'description', 'retailPrice', 'amount', 'discount', 'total', 'actions'];
  dataSource: MatTableDataSource<Shopping>;

  private subscriptionDataSource: Subscription;
  @ViewChild('code', {static: true}) private elementRef: ElementRef;

  constructor(private dialog: MatDialog, private shoppingCartService: ShoppingCartService) {
    this.subscriptionDataSource = this.shoppingCartService.shoppingCartObservable().subscribe(
      data => {
        this.dataSource = new MatTableDataSource<Shopping>(data);
      }
    );

  }

  ngOnInit(): void {
    this.elementRef.nativeElement.focus();
  }

  totalShoppingCart(): number {
    return this.shoppingCartService.getTotalShoppingCart();
  }

  indexShoppingCart(): number {
    return this.shoppingCartService.getIndexShoppingCart() === 0 ? undefined : this.shoppingCartService.getIndexShoppingCart();
  }

  priceLabel(shopping: Shopping): any {
    if (this.isArticleVarious(shopping.code)) {
      return Math.round(shopping.total / shopping.amount * 100) / 100;
    } else {
      return shopping.retailPrice;
    }
  }

  incrementAmount(shopping: Shopping): void {
    shopping.amount++;
    if (shopping.amount === 0) {
      shopping.amount++;
    }
    shopping.updateTotal();
    this.shoppingCartService.synchronizeCartTotal();
  }

  decreaseAmount(shopping: Shopping): any {
    shopping.amount--;
    if (shopping.amount === 0) {
      shopping.amount--;
      shopping.committed = true;
    }
    shopping.updateTotal();
    this.shoppingCartService.synchronizeCartTotal();
  }

  discountLabel(shopping: Shopping): string {
    return this.isArticleVarious(shopping.code) ? '' : '' + shopping.discount;
  }

  isArticleVarious(code: string): any {
    return ShoppingCartService.isArticleVarious(code);
  }

  updateDiscount(shopping: Shopping, event: any): void {
    if (!this.isArticleVarious(shopping.code)) {
      shopping.discount = Number(event.target.value);
      if (shopping.discount < 0) {
        shopping.discount = 0;
      }
      if (shopping.discount > 100) {
        shopping.discount = 100;
      }
      shopping.updateTotal();
      this.shoppingCartService.synchronizeCartTotal();
    }
  }

  updateTotal(shopping: Shopping, event: any): void {
    shopping.total = Number(event.target.value);
    if (shopping.total > (shopping.retailPrice * shopping.amount)) {
      shopping.total = shopping.retailPrice * shopping.amount;
    }
    if (shopping.total < 0) {
      shopping.total = 0;
    }
    shopping.updateDiscount();
    this.shoppingCartService.synchronizeCartTotal();
  }

  exchange(): void {
    this.shoppingCartService.exchange();
  }

  changeCommitted(shopping: Shopping): void {
    shopping.committed = !shopping.committed;
  }

  delete(shopping: Shopping): void {
    this.shoppingCartService.delete(shopping);
  }

  add(codeValue: string): void {
    this.shoppingCartService.add(codeValue).subscribe();
  }

  stockLabel(): string {
    return (this.shoppingCartService.getLastArticle()) ? 'Stock of ' + this.shoppingCartService.getLastArticle().description : 'Stock';
  }

  stockValue(): number {
    return (this.shoppingCartService.getLastArticle()) ? this.shoppingCartService.getLastArticle().stock : null;
  }

  isEmpty(): boolean {
    return this.shoppingCartService.isEmpty();
  }

  checkOut(): void {
    this.dialog.open(CheckOutDialogComponent).afterClosed().subscribe(
      () => this.ngOnInit()
    );
  }

  createBudget(): void {
    // TODO create budget
  }

  addDiscount(mobile): void {
    // TODO add discount
  }

  addOffer(offer): void {
    // TODO add offer
  }

  ngOnDestroy(): void {
    this.subscriptionDataSource.unsubscribe();
  }

}
