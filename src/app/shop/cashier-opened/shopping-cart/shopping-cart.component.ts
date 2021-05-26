import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Observable, of} from 'rxjs';

import {ShoppingCartService} from './shopping-cart.service';
import {Shopping} from '../../shared/services/models/shopping.model';
import {CheckOutDialogComponent} from './check-out-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {ShoppingState} from '../../shared/services/models/shopping-state.model';
import {NumberDialogComponent} from '@shared/dialogs/number-dialog.component';
import {ArticleFamilyViewComponent} from './article-family-view/article-family-view.component';
import {BudgetDialogComponent} from '../../budgets/budget-dialog.component';


@Component({
  selector: 'app-shopping-cart',
  styleUrls: ['shopping-cart.component.css'],
  templateUrl: 'shopping-cart.component.html'
})
export class ShoppingCartComponent implements OnInit {
  static SHOPPING_CART_NUM = 4;

  barcode: string;
  barcodes: Observable<number[]> = of([]);
  displayedColumns = ['id', 'description', 'retailPrice', 'amount', 'discount', 'total', 'actions'];
  shoppingCart: Shopping[] = [];
  indexShoppingCart = 0;
  totalShoppingCart = 0;
  private shoppingCartList: Array<Array<Shopping>> = [];
  @ViewChild('code', {static: true}) private elementRef: ElementRef;

  constructor(private dialog: MatDialog, private shoppingCartService: ShoppingCartService) {
    for (let i = 0; i < ShoppingCartComponent.SHOPPING_CART_NUM; i++) {
      this.shoppingCartList.push([]);
    }
    this.shoppingCart = [];
  }

  ngOnInit(): void {
    this.elementRef.nativeElement.focus();
    this.shoppingCart = [];
    this.synchronizeShoppingCart();
  }

  synchronizeShoppingCart(): void {
    this.shoppingCart = [...this.shoppingCart];
    let total = 0;
    for (const shopping of this.shoppingCart) {
      total = total + shopping.total;
    }
    this.totalShoppingCart = Math.round(total * 100) / 100;
  }

  addBarcode(barcode): void {
    this.shoppingCartService
      .read(barcode)
      .subscribe(newShopping => {
        this.shoppingCart.push(newShopping);
        console.log(newShopping);
        this.synchronizeShoppingCart();
      });
    this.elementRef.nativeElement.focus();
  }
  incrementAmount(shopping: Shopping): void {
    shopping.amount++;
    if (shopping.amount === 0) {
      shopping.amount++;
    }
    shopping.updateTotal();
    this.synchronizeShoppingCart();
  }

  decreaseAmount(shopping: Shopping): any {
    shopping.amount--;
    if (shopping.amount === 0) {
      shopping.amount--;
      shopping.state = ShoppingState.COMMITTED;
    }
    shopping.updateTotal();
    this.synchronizeShoppingCart();
  }

  updateDiscount(shopping: Shopping): void {
    this.dialog.open(NumberDialogComponent, {data: shopping.discount})
      .afterClosed()
      .subscribe(result => {
        if (result) {
          shopping.discount = result;
          if (shopping.discount < 0) {
            shopping.discount = 0;
          }
          if (shopping.discount > 100) {
            shopping.discount = 100;
          }
          shopping.updateTotal();
          this.synchronizeShoppingCart();
        }
      });
  }

  updateTotal(shopping: Shopping): void {
    this.dialog.open(NumberDialogComponent, {data: shopping.total})
      .afterClosed()
      .subscribe(result => {
        if (result) {
          shopping.total = result;
          if (shopping.total > (shopping.retailPrice * shopping.amount)) {
            shopping.total = shopping.retailPrice * shopping.amount;
          }
          if (shopping.total < 0) {
            shopping.total = 0;
          }
          shopping.updateDiscount();
          this.synchronizeShoppingCart();
        }
      });
  }

  delete(shopping: Shopping): void {
    const index = this.shoppingCart.indexOf(shopping);
    if (index > -1) {
      this.shoppingCart.splice(index, 1);
    }
    this.synchronizeShoppingCart();
  }


  checkboxState(state: ShoppingState): boolean {
    return state === ShoppingState.COMMITTED;
  }

  changeCommitted(shopping: Shopping): void {
    if (shopping.state === ShoppingState.COMMITTED) {
      shopping.state = ShoppingState.NOT_COMMITTED;
    } else {
      shopping.state = ShoppingState.COMMITTED;
    }
  }

  isEmpty(): boolean {
    return (!this.shoppingCart || this.shoppingCart.length === 0);
  }

  exchangeShoppingCart(): void {
    this.shoppingCartList[this.indexShoppingCart++] = this.shoppingCart;
    this.indexShoppingCart %= ShoppingCartComponent.SHOPPING_CART_NUM;
    this.shoppingCart = this.shoppingCartList[this.indexShoppingCart];
    this.synchronizeShoppingCart();
  }

  checkOut(): void {
    this.dialog.open(CheckOutDialogComponent, {data: this.shoppingCart}).afterClosed().subscribe(
      result => {
        if (result) {
          this.ngOnInit();
        }
      }
    );
  }

  createBudget(): void {
    this.dialog.open(BudgetDialogComponent, {data: this.shoppingCart}).afterClosed().subscribe(
      () => {
        this.dialog.closeAll();
      }
      , () => this.dialog.closeAll()
    );
  }
  addBudget(id): void {
    this.shoppingCartService
      .readBudget(id)
      .subscribe(newShopping => {
        console.log(newShopping.shoppingList);
        for (let i = 0; i < newShopping.shoppingList.length; i++) {
          this.shoppingCart.push(newShopping.shoppingList[i]);
          this.shoppingCart.forEach(total=>{
            total.total=Shopping.round2decimal(total.retailPrice * total.amount * (1 - total.discount / 100));
            total.state = ShoppingState.COMMITTED;
          });
        }
        console.log(newShopping);
        this.synchronizeShoppingCart();
      });
    this.elementRef.nativeElement.focus();
  }
  addDiscount(mobile): void {
    this.shoppingCartService
      .addDiscount(mobile)
      .subscribe(customer => {
        if (customer !== null) {
          if (customer[0].minimumPurchase <= this.totalShoppingCart) {
            this.shoppingCart.forEach(item => {
              item.discount = customer[0].discount;
              item.updateTotal();
            });
            this.synchronizeShoppingCart();
          }}});
  }

  addOffer(offer): void {
    this.shoppingCartService
      .readOffer(offer)
      .subscribe(newOffer => {
        this.shoppingCart
          .forEach(element => {
            const barcodeSearch = newOffer.articleBarcodes
              .find(barcode => barcode === element.barcode);
            const expireDateSearch = new Date(newOffer.expiryDate).getTime();
            if (barcodeSearch !== undefined && (expireDateSearch > Date.now())) {
              element.discount = newOffer.discount;
            } else {
              element.discount = 0;
            }
            element.updateTotal();
          });
        this.synchronizeShoppingCart();
      });
  }

  openArticleFamily(): void {
    this.dialog.open(ArticleFamilyViewComponent, {
      minWidth: '600px',
      minHeight: '300px'
    }).afterClosed().subscribe(result => {
      if (result !== true && result !== undefined) {
        this.addBarcode(result);
      }
    });
  }
}
