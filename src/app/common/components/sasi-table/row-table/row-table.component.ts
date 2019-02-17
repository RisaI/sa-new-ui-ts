import {Component, Input, OnInit} from '@angular/core';
import {SasiCell, SasiColumn, SasiTableOptions} from '../sasi-table.component';

@Component({
  selector: 'app-row-table',
  templateUrl: './row-table.component.html',
  styleUrls: ['./row-table.component.css']
})
export class RowTableComponent implements OnInit {

  @Input() data: [];
  @Input() columnHighlightEnable = false;
  @Input() options: SasiTableOptions;

  colControlClassName = 'aa';
  highlightedColumn = -1;

  constructor() { }

  ngOnInit() {
  }

  /* HIGHLIGHTNING */

  isColumnHighlighted(column: number) {
    if (!this.options.highlightColumn ) {
      return false;
    }
    return column === this.highlightedColumn;
  }

  setHighlightedColumn(column: number) {
    this.highlightedColumn = column;
  }

  getCellRawData(row, columnIndex: SasiColumn): SasiCell { // Todo duplicated with sasi-table
    const cellData = this.getCell(row, columnIndex);
    return cellData !== null ? cellData.rawData : null;
  }

  getCell(row, columnIndex: SasiColumn): SasiCell {
    let cellData = row[columnIndex.index];
    if (cellData === undefined) {
      console.error('Cannot find data in %s row, and columnIndex: %s', row.toString(), columnIndex.index);
      cellData = null;
    }
    return cellData;
  }

  setClassInControlCol(className: string) {

  }
}
