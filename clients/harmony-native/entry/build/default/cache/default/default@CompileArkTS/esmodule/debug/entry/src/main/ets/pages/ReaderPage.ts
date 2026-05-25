if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ReaderPage_Params {
    comicId?: number;
    controller?: webview.WebviewController;
}
import { Constants } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
import webview from "@ohos:web.webview";
class ReaderPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__comicId = new ObservedPropertySimplePU(0, this, "comicId");
        this.controller = new webview.WebviewController();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ReaderPage_Params) {
        if (params.comicId !== undefined) {
            this.comicId = params.comicId;
        }
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
    }
    updateStateVars(params: ReaderPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__comicId.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__comicId.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __comicId: ObservedPropertySimplePU<number>;
    get comicId() {
        return this.__comicId.get();
    }
    set comicId(newValue: number) {
        this.__comicId.set(newValue);
    }
    private controller: webview.WebviewController;
    aboutToAppear(): void {
        const params = this.getUIContext().getRouter().getParams() as Record<string, number>;
        if (params && params.comicId) {
            this.comicId = params.comicId;
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#0F172A');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height(56);
            Row.padding({ left: 16, right: 16 });
            Row.alignItems(VerticalAlign.Center);
            Row.backgroundColor('#111827');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 125830087, "type": 20000, params: [], "bundleName": "com.comicreader.harmony", "moduleName": "entry" });
            Image.width(24);
            Image.height(24);
            Image.fillColor('#E5E7EB');
            Image.onClick(() => this.getUIContext().getRouter().back());
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('漫画阅读');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#E5E7EB');
            Text.layoutWeight(1);
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width(24);
            Row.height(24);
        }, Row);
        Row.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Web.create({ src: `${Constants.BASE_URL}/comic/${this.comicId}`, controller: this.controller });
            Web.layoutWeight(1);
            Web.width('100%');
            Web.domStorageAccess(true);
            Web.javaScriptAccess(true);
            Web.mixedMode(MixedMode.All);
            Web.onlineImageAccess(true);
            Web.zoomAccess(true);
            Web.cacheMode(CacheMode.Default);
            Web.darkMode(WebDarkMode.On);
        }, Web);
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "ReaderPage";
    }
}
registerNamedRoute(() => new ReaderPage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/ReaderPage", pageFullPath: "entry/src/main/ets/pages/ReaderPage", integratedHsp: "false", moduleType: "followWithHap" });
