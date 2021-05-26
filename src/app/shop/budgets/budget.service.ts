import {HttpService} from '@core/http.service';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {EndPoints} from '@shared/end-points';
import {map} from 'rxjs/operators';
import {BudgetCreation} from "./budget-creation.model";






@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  static ID = '/id';
  constructor(private httpService: HttpService) {
  }

  read(id: string): Observable<BudgetCreation> {
    return this.httpService
      .get(EndPoints.BUDGETS  + '/' + id);
  }

  searchBudget(reference: string): Observable<string[]> {
    return this.httpService
      .param('reference', reference)
      .get(EndPoints.BUDGETS  + BudgetService.ID )
      .pipe(
        map(response => response.references)
      );
  }
}
