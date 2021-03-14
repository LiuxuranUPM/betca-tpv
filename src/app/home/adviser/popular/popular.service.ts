import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Article} from '../../shared/article.model';
import {TagService} from '../../shared/tag.service';
import {map} from 'rxjs/operators';
import {ShoppingBasketService} from '../../shared/shopping-basket.service';

@Injectable({
  providedIn: 'root'
})
export class PopularService {
  article1: Article = {barcode: '111111', description: 'First Observable article of Service', retailPrice: 12};
  article2: Article = {barcode: '222222', description: 'Second Observable article of Service', retailPrice: 23};
  popularArticles: Article[] = [this.article1, this.article2];

  constructor(private tagService: TagService, private shoppingBasketService: ShoppingBasketService) {
  }

  searchPopularArticles(): Observable<Article[]> {
    // return of(this.popularArticles);
    return this.tagService.read('popular').pipe(map(tag => tag.articles));
  }
}
