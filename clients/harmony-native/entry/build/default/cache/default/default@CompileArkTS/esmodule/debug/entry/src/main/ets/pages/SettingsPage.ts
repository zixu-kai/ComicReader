if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface SettingsPage_Params {
    serverUrl?: string;
    scanStatus?: string;
    isScanning?: boolean;
    isSaving?: boolean;
    context?: common.UIAbilityContext;
}
import { Constants, navigateToTab } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
import { ComicService } from "@bundle:com.comicreader.harmony/entry/ets/service/ComicService";
import api from "@bundle:com.comicreader.harmony/entry/ets/common/HttpUtil";
import preferences from "@ohos:data.preferences";
import type common from "@ohos:app.ability.common";
class SettingsPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__serverUrl = new ObservedPropertySimplePU(Constants.BASE_URL, this, "serverUrl");
        this.__scanStatus = new ObservedPropertySimplePU('', this, "scanStatus");
        this.__isScanning = new ObservedPropertySimplePU(false, this, "isScanning");
        this.__isSaving = new ObservedPropertySimplePU(false, this, "isSaving");
        this.context = getContext(this) as common.UIAbilityContext;
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: SettingsPage_Params) {
        if (params.serverUrl !== undefined) {
            this.serverUrl = params.serverUrl;
        }
        if (params.scanStatus !== undefined) {
            this.scanStatus = params.scanStatus;
        }
        if (params.isScanning !== undefined) {
            this.isScanning = params.isScanning;
        }
        if (params.isSaving !== undefined) {
            this.isSaving = params.isSaving;
        }
        if (params.context !== undefined) {
            this.context = params.context;
        }
    }
    updateStateVars(params: SettingsPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__serverUrl.purgeDependencyOnElmtId(rmElmtId);
        this.__scanStatus.purgeDependencyOnElmtId(rmElmtId);
        this.__isScanning.purgeDependencyOnElmtId(rmElmtId);
        this.__isSaving.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__serverUrl.aboutToBeDeleted();
        this.__scanStatus.aboutToBeDeleted();
        this.__isScanning.aboutToBeDeleted();
        this.__isSaving.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __serverUrl: ObservedPropertySimplePU<string>;
    get serverUrl() {
        return this.__serverUrl.get();
    }
    set serverUrl(newValue: string) {
        this.__serverUrl.set(newValue);
    }
    private __scanStatus: ObservedPropertySimplePU<string>;
    get scanStatus() {
        return this.__scanStatus.get();
    }
    set scanStatus(newValue: string) {
        this.__scanStatus.set(newValue);
    }
    private __isScanning: ObservedPropertySimplePU<boolean>;
    get isScanning() {
        return this.__isScanning.get();
    }
    set isScanning(newValue: boolean) {
        this.__isScanning.set(newValue);
    }
    private __isSaving: ObservedPropertySimplePU<boolean>;
    get isSaving() {
        return this.__isSaving.get();
    }
    set isSaving(newValue: boolean) {
        this.__isSaving.set(newValue);
    }
    private context: common.UIAbilityContext;
    async aboutToAppear(): Promise<void> {
        await this.loadPreferences();
    }
    async loadPreferences(): Promise<void> {
        try {
            const pref = await preferences.getPreferences(this.context, Constants.PREF_NAME);
            const savedUrl = await pref.get(Constants.KEY_SERVER_URL, Constants.BASE_URL) as string;
            this.serverUrl = savedUrl;
        }
        catch (e) {
            console.error('Failed to load preferences: ' + JSON.stringify(e));
        }
    }
    async savePreferences(): Promise<void> {
        try {
            this.isSaving = true;
            const pref = await preferences.getPreferences(this.context, Constants.PREF_NAME);
            await pref.put(Constants.KEY_SERVER_URL, this.serverUrl);
            await pref.flush();
            api.defaults.baseURL = this.serverUrl;
            this.isSaving = false;
        }
        catch (e) {
            console.error('Failed to save preferences: ' + JSON.stringify(e));
            this.isSaving = false;
        }
    }
    async startScan(): Promise<void> {
        this.isScanning = true;
        this.scanStatus = '扫描中...';
        try {
            const result = await ComicService.scan();
            this.scanStatus = `扫描完成: 新增${result.added} 更新${result.updated} 移除${result.removed}`;
        }
        catch (e) {
            this.scanStatus = '扫描失败: ' + JSON.stringify(e);
        }
        finally {
            this.isScanning = false;
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F1F3F5');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height(56);
            Row.padding({ left: 16, right: 16 });
            Row.alignItems(VerticalAlign.Center);
            Row.backgroundColor('#FFFFFF');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 125830087, "type": 20000, params: [], "bundleName": "com.comicreader.harmony", "moduleName": "entry" });
            Image.width(24);
            Image.height(24);
            Image.fillColor('#181818');
            Image.onClick(async () => {
                await this.savePreferences();
                try {
                    navigateToTab(this.getUIContext(), 'pages/HomePage');
                }
                catch (e) {
                    console.error('Back failed: ' + JSON.stringify(e));
                }
            });
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('设置');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#181818');
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
            Scroll.create();
            Scroll.layoutWeight(1);
            Scroll.width('100%');
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(12);
            Column.padding(16);
            Column.shadow({ radius: 6, color: '#10000000', offsetY: 1 });
            Column.margin({ top: 16, left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('服务器配置');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#181818');
            Text.width('100%');
            Text.margin({ bottom: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('服务器地址');
            Text.fontSize(14);
            Text.fontColor('#999999');
            Text.width('100%');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.serverUrl, placeholder: 'http://IP:端口' });
            TextInput.width('100%');
            TextInput.height(44);
            TextInput.type(InputType.Normal);
            TextInput.fontColor('#181818');
            TextInput.backgroundColor('#FFFFFF');
            TextInput.onChange((value: string) => {
                this.serverUrl = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('格式: http://IP地址:端口号');
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.width('100%');
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('保存服务器地址');
            Button.width('100%');
            Button.height(44);
            Button.fontSize(15);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#007DFF');
            Button.borderRadius(22);
            Button.margin({ top: 16 });
            Button.enabled(!this.isSaving);
            Button.onClick(() => this.savePreferences());
        }, Button);
        Button.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(12);
            Column.padding(16);
            Column.shadow({ radius: 6, color: '#10000000', offsetY: 1 });
            Column.margin({ top: 12, left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('漫画扫描');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#181818');
            Text.width('100%');
            Text.margin({ bottom: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('扫描服务器上的漫画目录，发现新增或变更的漫画');
            Text.fontSize(14);
            Text.fontColor('#999999');
            Text.width('100%');
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('开始扫描');
            Button.width('100%');
            Button.height(44);
            Button.fontSize(15);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#007DFF');
            Button.borderRadius(22);
            Button.margin({ top: 8 });
            Button.enabled(!this.isScanning);
            Button.onClick(() => this.startScan());
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.scanStatus) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.scanStatus);
                        Text.fontSize(14);
                        Text.fontColor(this.scanStatus.includes('失败') ? '#FA2A2D' : '#45A848');
                        Text.width('100%');
                        Text.margin({ top: 12 });
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(12);
            Column.padding(16);
            Column.shadow({ radius: 6, color: '#10000000', offsetY: 1 });
            Column.margin({ top: 12, left: 16, right: 16, bottom: 24 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('关于');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#181818');
            Text.width('100%');
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ top: 8, bottom: 8 });
            Row.border({ width: { bottom: 0.5 }, color: '#E5E5E5' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('应用名称');
            Text.fontSize(14);
            Text.fontColor('#181818');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('ComicReader');
            Text.fontSize(14);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ top: 8, bottom: 8 });
            Row.border({ width: { bottom: 0.5 }, color: '#E5E5E5' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('版本');
            Text.fontSize(14);
            Text.fontColor('#181818');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('1.0.0');
            Text.fontSize(14);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ top: 8, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('技术栈');
            Text.fontSize(14);
            Text.fontColor('#181818');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('ArkTS + HarmonyOS NEXT');
            Text.fontSize(14);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
        Column.pop();
        Scroll.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "SettingsPage";
    }
}
registerNamedRoute(() => new SettingsPage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/SettingsPage", pageFullPath: "entry/src/main/ets/pages/SettingsPage", integratedHsp: "false", moduleType: "followWithHap" });
