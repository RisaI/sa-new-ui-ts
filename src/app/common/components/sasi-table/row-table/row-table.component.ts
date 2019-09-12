import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {SasiRow, SasiTableOptions} from '../sasi-table.component';
import {LocalStorage, LocalStorageService} from 'ngx-store';
import {SelectedRow} from './selected-row';
import {OnSelectService} from '../on-select.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-row-table',
  templateUrl: './row-table.component.html',
  styleUrls: ['./row-table.component.css']
})
export class RowTableComponent implements OnInit, OnDestroy {


  @Input() data: SasiRow;
  @Input() groupName: string;
  @Input() columnHighlightEnable = false;
  @Input() options: SasiTableOptions;
  @Output() selectEmit = new EventEmitter<Array<SelectedRow>>();
  selectedRows: Array<SelectedRow>;
  subscription: Subscription;

  @LocalStorage() highlightedColumn = -1;

  constructor(private localStorageService: LocalStorageService,
              private onSelectService: OnSelectService
  ) {
  }

  ngOnDestroy(): void {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.subscription = this.onSelectService.selectAll$.subscribe(value => this.selectRow(this.data.getCell('name').value, value));
    this.selectedRows =  this.localStorageService.get(this.options.storageNamePrefix + '_selected');
    if (this.selectedRows === null) {
      this.selectedRows = [];
    }

  }

  /* HIGHLIGHTNING */

  isColumnHighlighted(column: number) {
    if (!this.options.highlightColumn) {
      return false;
    }
    return column === this.highlightedColumn;
  }

  setHighlightedColumn(column: number) {
    this.highlightedColumn = column;
  }

  isSelectedRow(name: string): boolean {
    return this.findIndex(name) > -1;
  }

  selectRow(name: string, ignore?: boolean | false) {
    this.selectedRows =  this.localStorageService.get(this.options.storageNamePrefix + '_selected');
    if (this.selectedRows === null) {
      this.selectedRows = [];
    }
    const index = this.findIndex(name);
    if (index > -1 && !ignore) {
      this.selectedRows.splice(index, 1);
    }
    if (index < 0) {
      this.selectedRows.push(new SelectedRow(this.groupName, name));
    }
    // @ts-ignore
    this.localStorageService.set(this.options.storageNamePrefix + '_selected', this.selectedRows);
    this.selectEmit.emit(this.selectedRows);
  }

  findIndex(name: string) {
    if (this.selectedRows === undefined) {
      return -1;
    }
    return this.selectedRows.findIndex(value => value.rowName === name && value.groupName === this.groupName);
  }
}
