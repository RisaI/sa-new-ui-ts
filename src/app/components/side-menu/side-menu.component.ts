import {Component, OnInit} from '@angular/core';
import {MenuTree} from '../../common/models/MenuTree';
import {environment} from '../../../environments/environment';
import {MetricService} from '../../metric.service';
import {Datacenter} from '../../common/models/Datacenter';
import {MenuItem} from '../../common/models/MenuItem';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.css']
})
export class SideMenuComponent implements OnInit {

  items: MenuTree[];
  filteredItems: MenuTree[];
  searchExpression: string;
  poolMetricLinks = [
    {id: 1, linkPart: 'dashboard', name: 'Dashboard'},
    {id: 2, linkPart: 'serverBoard', name: 'Server board'},
    {id: 3, linkPart: 'dpSla', name: 'DP Pool Board and SLA'},
    {id: 4, linkPart: 'deepAnalysis', name: 'Deep Analysis'},
    {id: 5, linkPart: 'cache', name: 'Cache Board'},
    {id: 6, linkPart: 'adapters', name: 'CHA Adapters Board'},
    {id: 7, linkPart: 'trends', name: 'Trends'}
  ];
  globalStatisticsLinks = [];
  private defaultDataCenter: number;

  constructor(private metricService: MetricService) {
  }

  ngOnInit() {
    this.metricService.getDatacenters().subscribe(data => {
      this.items = this.convertMenu(data.datacenters);
      this.setDefaultDataCenter(data.datacenters);
      this.filteredItems = this.items;
    });
  }

  private setDefaultDataCenter(dataCenters: Datacenter[]) {
    if (dataCenters.length > 0) {
      this.defaultDataCenter = dataCenters[0].id;
      this.setGlobalStatisticsLinks();
    }
  }

  private setGlobalStatisticsLinks() {
    this.globalStatisticsLinks = [
      {id: 1, linkPart: `/global-statistics/${this.defaultDataCenter}/performance`, name: 'Performance Statistics'},
      {id: 2, linkPart: `/global-statistics/${this.defaultDataCenter}/capacity`, name: 'Capacity Statistics'},
      {id: 3, linkPart: `/global-statistics/${this.defaultDataCenter}/dp-sla`, name: 'DP SLA Statistics'},
      {id: 3, linkPart: `/global-statistics/${this.defaultDataCenter}/adapters`, name: 'Adapters Statistics'}
    ];
  }

  search(): void {
    if (this.searchExpression === '') {
      this.filteredItems = this.items;
      return;
    }
    let filteredTree = null;
    this.filteredItems = [];
    for (const tree of this.items) {
      for (const item of tree.items) {
        if (item.name.indexOf(this.searchExpression) > -1) {
          if (filteredTree === null) {
            filteredTree = new MenuTree(tree.label, []);
          }
          filteredTree.items.push(item);
        }
      }
      if (filteredTree !== null) {
        this.filteredItems.push(filteredTree);
      }
      filteredTree = null;
    }
  }

  private convertMenu(data: Datacenter[]): MenuTree[] {
    const menu: MenuTree[] = [];
    for (const dataCenter of data) {
      const items: MenuItem[] = [];
      for (const system of dataCenter.systems) {
        items.push(new MenuItem(system.id, system.name));
      }
      menu.push(new MenuTree(dataCenter.label, items));
    }
    return menu;
  }
}

