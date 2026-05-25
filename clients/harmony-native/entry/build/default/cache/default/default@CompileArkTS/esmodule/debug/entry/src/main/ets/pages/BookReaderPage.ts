if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BookReaderPage_Params {
    bookId?: number;
    controller?: webview.WebviewController;
}
import { Constants } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
import webview from "@ohos:web.webview";
class BookReaderPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__bookId = new ObservedPropertySimplePU(0, this, "bookId");
        this.controller = new webview.WebviewController();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BookReaderPage_Params) {
        if (params.bookId !== undefined) {
            this.bookId = params.bookId;
        }
        if (params.controller !== undefined) {
            this.controller = params.controller;
        }
    }
    updateStateVars(params: BookReaderPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__bookId.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__bookId.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __bookId: ObservedPropertySimplePU<number>;
    get bookId() {
        return this.__bookId.get();
    }
    set bookId(newValue: number) {
        this.__bookId.set(newValue);
    }
    private controller: webview.WebviewController;
    aboutToAppear(): void {
        const params = this.getUIContext().getRouter().getParams() as Record<string, number>;
        if (params && params.bookId) {
            this.bookId = params.bookId;
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
            Image.onClick(() => { try {
                this.getUIContext().getRouter().back();
            }
            catch (e) {
                console.error('Back failed: ' + JSON.stringify(e));
            } });
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('图书阅读');
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
            Web.create({ src: `${Constants.BASE_URL}/book-reader/${this.bookId}`, controller: this.controller });
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
        return "BookReaderPage";
    }
}
registerNamedRoute(() => new BookReaderPage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/BookReaderPage", pageFullPath: "entry/src/main/ets/pages/BookReaderPage", integratedHsp: "false", moduleType: "followWithHap" });
