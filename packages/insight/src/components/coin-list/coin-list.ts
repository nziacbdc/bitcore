import { Component, Input, OnInit } from '@angular/core';
import { Events } from 'ionic-angular';
import _ from 'lodash';
import { AddressProvider } from '../../providers/address/address';
import { ChainNetwork } from '../../providers/api/api';
import { BlocksProvider } from '../../providers/blocks/blocks';
import { TxsProvider } from '../../providers/transactions/transactions';

@Component({
  selector: 'coin-list',
  templateUrl: 'coin-list.html'
})
export class CoinListComponent implements OnInit {
  @Input()
  public addrStr?: string;
  @Input()
  public chainNetwork: ChainNetwork;

  public txids: any = {};
  public txs: any = [];
  public coins: any = [];
  public showTransactions: boolean;
  public mostRecentOrderSelected = true;
  public loading;
  public blockTipHeight?;
  public limit = 10;
  public chunkSize = 100;

  constructor(
    private addrProvider: AddressProvider,
    private blocksProvider: BlocksProvider,
    private txsProvider: TxsProvider,
    private events: Events
  ) {}

  public ngOnInit(): void {
    if (this.txs && this.txs.length === 0) {
      this.loading = true;
      this.blocksProvider
        .getCurrentHeight(this.chainNetwork)
        .subscribe(data => {
          this.blockTipHeight = data.height;
        });
      this.addrProvider
        .getAddressActivity(this.addrStr, this.chainNetwork)
        .subscribe(
          data => {
            this.txs = _.sortBy(data.map(this.txsProvider.toAppCoin), ['height']).reverse();
            this.events.publish('CoinList', { length: this.txs.length });
            this.showTransactions = true;
            this.loading = false;
          },
          () => {
            this.loading = false;
            this.showTransactions = false;
          }
        );
    }
  }

  public sortBy(order: string) {
    if (this.mostRecentOrderSelected && order === 'Most Recent') {
      return this.txs;
    } else if (!this.mostRecentOrderSelected && order === 'Oldest') {
      return this.txs;
    }

    this.txs =
      order === 'Most Recent'
        ? _.sortBy(this.txs, ['height']).reverse()
        : _.sortBy(this.txs, ['height']);

    this.mostRecentOrderSelected = order === 'Most Recent';
  }


  public loadMore(infiniteScroll) {
    this.limit += this.chunkSize;
    this.chunkSize *= 2;
    infiniteScroll.complete();
  }
}
