import { mixins } from 'vue-class-component';
import { Component, Inject, Vue } from 'vue-property-decorator';
import { IArzt } from '@/shared/model/arzt.model';
import AlertService from '@/shared/alert/alert.service';

import ArztService from './arzt.service';

@Component
export default class Arzt extends Vue {
  @Inject('alertService') private alertService: () => AlertService;
  @Inject('arztService') private arztService: () => ArztService;
  private removeId: string = null;
  public itemsPerPage = 20;
  public queryCount: number = null;
  public page = 1;
  public previousPage: number = null;
  public propOrder = 'id';
  public reverse = false;
  public totalItems = 0;
  public arzts: IArzt[] = [];

  public dismissCountDown: number = this.$store.getters.dismissCountDown;
  public dismissSecs: number = this.$store.getters.dismissSecs;
  public alertType: string = this.$store.getters.alertType;
  public alertMessage: any = this.$store.getters.alertMessage;

  public getAlertFromStore() {
    this.dismissCountDown = this.$store.getters.dismissCountDown;
    this.dismissSecs = this.$store.getters.dismissSecs;
    this.alertType = this.$store.getters.alertType;
    this.alertMessage = this.$store.getters.alertMessage;
  }

  public countDownChanged(dismissCountDown: number) {
    this.alertService().countDownChanged(dismissCountDown);
    this.getAlertFromStore();
  }

  public mounted(): void {
    this.retrieveAllArzts();
  }

  public clear(): void {
    this.page = 1;
    this.retrieveAllArzts();
  }

  public retrieveAllArzts(): void {
    const paginationQuery = {
      page: this.page - 1,
      size: this.itemsPerPage,
      sort: this.sort()
    };
    this.arztService()
      .retrieve(paginationQuery)
      .then(res => {
        this.arzts = res.data;
        this.totalItems = Number(res.headers['x-total-count']);
        this.queryCount = this.totalItems;
      });
  }

  public prepareRemove(instance): void {
    this.removeId = instance.id;
  }

  public removeArzt(): void {
    this.arztService()
      .delete(this.removeId)
      .then(() => {
        const message = this.$t('pkvApp.arzt.deleted', { param: this.removeId });
        this.alertService().showAlert(message, 'danger');
        this.getAlertFromStore();

        this.removeId = null;
        this.retrieveAllArzts();
        this.closeDialog();
      });
  }

  public sort(): Array<any> {
    const result = [this.propOrder + ',' + (this.reverse ? 'asc' : 'desc')];
    if (this.propOrder !== 'id') {
      result.push('id');
    }
    return result;
  }

  public loadPage(page: number): void {
    if (page !== this.previousPage) {
      this.previousPage = page;
      this.transition();
    }
  }

  public transition(): void {
    this.retrieveAllArzts();
  }

  public changeOrder(propOrder): void {
    this.propOrder = propOrder;
    this.reverse = !this.reverse;
  }

  public closeDialog(): void {
    (<any>this.$refs.removeEntity).hide();
  }
}
