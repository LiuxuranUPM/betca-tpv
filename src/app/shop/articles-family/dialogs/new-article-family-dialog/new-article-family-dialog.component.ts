import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ArticleFamilyModel} from '../../../shared/services/models/article-family.model';
import {SharedArticlesFamilyService} from '../../../shared/services/shared.articles-family.service';

@Component({
  selector: 'app-new-article-family-dialog',
  templateUrl: './new-article-family-dialog.component.html',
  styleUrls: ['./new-article-family-dialog.component.css']
})

export class NewArticleFamilyDialogComponent {

  reference: string;
  description: string;
  types: string[];
  selectedType: string;


  constructor(@Inject(MAT_DIALOG_DATA) public parent: ArticleFamilyModel,
              private sharedArticlesFamilyService: SharedArticlesFamilyService,
              private dialogRef: MatDialogRef<NewArticleFamilyDialogComponent>) {
    this.types = ['ARTICLES', 'SIZE'];
    this.selectedType = this.types[0];
  }

  createArticlesFamily(): void {
    const articlesFamilyModel: ArticleFamilyModel = {
      reference: this.reference,
      description: this.description,
      type: this.selectedType,
    };

    this.sharedArticlesFamilyService.createArticleFamily(articlesFamilyModel, this.parent.reference).subscribe(
      result => {
        this.dialogRef.close(result);
      }
    );
  }

  changeSelection(value: any): void {
    this.selectedType = value;
  }
}
