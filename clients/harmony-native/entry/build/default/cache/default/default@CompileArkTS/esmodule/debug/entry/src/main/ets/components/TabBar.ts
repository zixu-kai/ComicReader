if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface TabBar_Params {
    currentTab?: number;
    onTabClick?: (tab: number) => void;
    tabs?: TabItem[];
}
import { TabItem } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
export class TabBar extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__currentTab = new SynchedPropertySimpleTwoWayPU(params.currentTab, this, "currentTab");
        this.onTabClick = (_tab: number) => { };
        this.tabs = [];
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: TabBar_Params) {
        if (params.onTabClick !== undefined) {
            this.onTabClick = params.onTabClick;
        }
        if (params.tabs !== undefined) {
            this.tabs = params.tabs;
        }
    }
    updateStateVars(params: TabBar_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__currentTab.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__currentTab.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __currentTab: SynchedPropertySimpleTwoWayPU<number>;
    get currentTab() {
        return this.__currentTab.get();
    }
    set currentTab(newValue: number) {
        this.__currentTab.set(newValue);
    }
    private onTabClick: (tab: number) => void;
    private tabs: TabItem[];
    aboutToAppear(): void {
        let tab0 = new TabItem();
        tab0.icon = '🏠';
        tab0.label = '首页';
        tab0.index = 0;
        let tab1 = new TabItem();
        tab1.icon = '📚';
        tab1.label = '漫画';
        tab1.index = 1;
        let tab2 = new TabItem();
        tab2.icon = '📖';
        tab2.label = '图书';
        tab2.index = 2;
        let tab3 = new TabItem();
        tab3.icon = '🏷';
        tab3.label = '分类';
        tab3.index = 3;
        let tab4 = new TabItem();
        tab4.icon = '⭐';
        tab4.label = '收藏';
        tab4.index = 4;
        let tab5 = new TabItem();
        tab5.icon = '🎲';
        tab5.label = '随机';
        tab5.index = 5;
        let tab6 = new TabItem();
        tab6.icon = '⚙';
        tab6.label = '设置';
        tab6.index = 6;
        this.tabs = [tab0, tab1, tab2, tab3, tab4, tab5, tab6];
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.backgroundColor('#FFFFFF');
            Row.border({ width: { top: 0.5 }, color: '#E5E5E5' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const tab = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.layoutWeight(1);
                    Column.justifyContent(FlexAlign.Center);
                    Column.alignItems(HorizontalAlign.Center);
                    Column.padding({ top: 6, bottom: 8 });
                    Column.onClick(() => {
                        this.onTabClick(tab.index);
                    });
                }, Column);
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(tab.icon);
                    Text.fontSize(20);
                }, Text);
                Text.pop();
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(tab.label);
                    Text.fontSize(10);
                    Text.fontColor(this.currentTab === tab.index ? '#007DFF' : '#999999');
                    Text.fontWeight(this.currentTab === tab.index ? FontWeight.Medium : FontWeight.Regular);
                    Text.margin({ top: 2 });
                }, Text);
                Text.pop();
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, this.tabs, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
