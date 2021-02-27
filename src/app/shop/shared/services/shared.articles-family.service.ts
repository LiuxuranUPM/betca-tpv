import {Injectable} from '@angular/core';
import {ArticleFamilyModel} from './models/article-family.model';
import {Observable, of} from "rxjs";
import {Article} from "./models/article.model";

@Injectable({
  providedIn: 'root'
})
export class SharedArticlesFamilyService {
  ARTICLES_DATA: ArticleFamilyModel[] = [
  /*{
  id: '1',
  name: 'ArticleFamily-Root',
  children: [{
    id: '2',
    name: 'ArticleFamily-Sub1',
    children: [{
      id: '1',
      name: 'ArticleFamily-Sub1-Sub1',
    }]
  },
    {
      id: '3',
      name: 'ArticleFamily-Sub2',
    }]}*/
  ];

  ARTICLES_FAMILY_DATA: ArticleFamilyModel[] = [
    {
      reference: '1',
      description: 'Zarzuela',
      type: 'composite'
    },
    {
      reference: '1',
      description: 'Varios',
      type: 'composite',

    }
  ];

  CHILDRENS_OF_ZZ: (ArticleFamilyModel|Article)[] = [
    {
      barcode: '8400000000031',
      description: 'descrip-a3',
      retailPrice: 10.12,
      providerCompany: 'pro1'
    },
    {
      reference: '1',
      description: 'Zz Falda',
      type: 'size'
    },
    {
      reference: '1',
      description: 'Zz Falda',
      type: 'size'
    }
  ];

  constructor() {
  }

  /*getData(): ArticleFamilyModel[] {
    return this.ARTICLES_DATA;
  }*/

  readChildren(articleFamilyModel?: ArticleFamilyModel): Observable<(ArticleFamilyModel|Article)[]> {
    return of(this.ARTICLES_FAMILY_DATA);
  }

  readChildrenTemporal(articleFamilyModel?: ArticleFamilyModel): Observable<(ArticleFamilyModel|Article)[]> {
    return of(this.CHILDRENS_OF_ZZ);
  }

  create(): any {

  }

  edit(): any {

  }

  delete(): any {

  }
}
