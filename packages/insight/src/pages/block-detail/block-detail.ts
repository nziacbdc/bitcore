import { Component, Injectable } from '@angular/core';
import { IonicPage, NavParams } from 'ionic-angular';
import { UTXO_CHAINS } from '../../constants';
import { ApiProvider, ChainNetwork } from '../../providers/api/api';
import { BlocksProvider } from '../../providers/blocks/blocks';
import { CurrencyProvider } from '../../providers/currency/currency';
import { PriceProvider } from '../../providers/price/price';
import { RedirProvider } from '../../providers/redir/redir';
import { TxsProvider } from '../../providers/transactions/transactions';
@Injectable()
@IonicPage({
  name: 'block-detail',
  segment: ':chain/:network/block/:blockHash',
  defaultHistory: ['home']
})
@Component({
  selector: 'page-block-detail',
  templateUrl: 'block-detail.html'
})
export class BlockDetailPage {
  public appUrl: string;
  public loading = true;
  public errorMessage: string;
  public confirmations: number;
  public block: any = {
    tx: []
  };
  public chainNetwork: ChainNetwork;

  private blockHash: string;

  constructor(
    public navParams: NavParams,
    public currencyProvider: CurrencyProvider,
    public redirProvider: RedirProvider,
    public txProvider: TxsProvider,
    private blocksProvider: BlocksProvider,
    private apiProvider: ApiProvider,
    private priceProvider: PriceProvider
  ) {
    this.blockHash = navParams.get('blockHash');
    const chain: string = navParams.get('chain');
    const network: string = navParams.get('network');

    this.chainNetwork = {
      chain,
      network
    };
    this.appUrl = apiProvider.getUrl(this.chainNetwork);
    this.apiProvider.changeNetwork(this.chainNetwork);
    this.currencyProvider.setCurrency(this.chainNetwork);
    this.priceProvider.setCurrency();
  }

  ionViewDidEnter() {
    this.blocksProvider.getBlock(this.blockHash, this.chainNetwork).subscribe(
      response => {
        const block = this.blocksProvider.toAppBlock(response);
        this.block = block;
        this.txProvider
          .getConfirmations(this.block.height, this.chainNetwork)
          .subscribe(confirmations => (this.confirmations = confirmations));
        this.loading = false;
      },
      err => {
        this.errorMessage = err;
        this.loading = false;
      }
    );
  }

  public goToPreviousBlock(): void {
    this.redirProvider.redir('block-detail', {
      blockHash: this.block.previousblockhash,
      chain: this.chainNetwork.chain,
      network: this.chainNetwork.network
    });
  }

  public goToNextBlock(): void {
    this.redirProvider.redir('block-detail', {
      blockHash: this.block.nextblockhash,
      chain: this.chainNetwork.chain,
      network: this.chainNetwork.network
    });
  }

  public goToAddress(addrStr: string): void {
    this.redirProvider.redir('address', {
      addrStr,
      chain: this.chainNetwork.chain,
      network: this.chainNetwork.network
    });
  }
}
