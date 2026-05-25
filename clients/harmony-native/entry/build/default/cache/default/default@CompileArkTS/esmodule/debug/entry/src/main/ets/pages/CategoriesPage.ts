if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface CategoriesPage_Params {
    categories?: Category[];
    tags?: Tag[];
    currentTab?: number;
    showAddCategoryDialog?: boolean;
    showAddTagDialog?: boolean;
    showDeleteConfirmDialog?: boolean;
    deleteType?: string;
    deleteId?: number;
    deleteName?: string;
    newCategoryName?: string;
    newCategoryDescription?: string;
    newTagName?: string;
}
import type { Category, Tag } from '../model/ComicModels';
import { CategoryService, TagService } from "@bundle:com.comicreader.harmony/entry/ets/service/ComicService";
import { navigateToTab } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
class CategoriesPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__categories = new ObservedPropertyObjectPU([], this, "categories");
        this.__tags = new ObservedPropertyObjectPU([], this, "tags");
        this.__currentTab = new ObservedPropertySimplePU(0, this, "currentTab");
        this.__showAddCategoryDialog = new ObservedPropertySimplePU(false, this, "showAddCategoryDialog");
        this.__showAddTagDialog = new ObservedPropertySimplePU(false, this, "showAddTagDialog");
        this.__showDeleteConfirmDialog = new ObservedPropertySimplePU(false, this, "showDeleteConfirmDialog");
        this.__deleteType = new ObservedPropertySimplePU('', this, "deleteType");
        this.__deleteId = new ObservedPropertySimplePU(0, this, "deleteId");
        this.__deleteName = new ObservedPropertySimplePU('', this, "deleteName");
        this.__newCategoryName = new ObservedPropertySimplePU('', this, "newCategoryName");
        this.__newCategoryDescription = new ObservedPropertySimplePU('', this, "newCategoryDescription");
        this.__newTagName = new ObservedPropertySimplePU('', this, "newTagName");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: CategoriesPage_Params) {
        if (params.categories !== undefined) {
            this.categories = params.categories;
        }
        if (params.tags !== undefined) {
            this.tags = params.tags;
        }
        if (params.currentTab !== undefined) {
            this.currentTab = params.currentTab;
        }
        if (params.showAddCategoryDialog !== undefined) {
            this.showAddCategoryDialog = params.showAddCategoryDialog;
        }
        if (params.showAddTagDialog !== undefined) {
            this.showAddTagDialog = params.showAddTagDialog;
        }
        if (params.showDeleteConfirmDialog !== undefined) {
            this.showDeleteConfirmDialog = params.showDeleteConfirmDialog;
        }
        if (params.deleteType !== undefined) {
            this.deleteType = params.deleteType;
        }
        if (params.deleteId !== undefined) {
            this.deleteId = params.deleteId;
        }
        if (params.deleteName !== undefined) {
            this.deleteName = params.deleteName;
        }
        if (params.newCategoryName !== undefined) {
            this.newCategoryName = params.newCategoryName;
        }
        if (params.newCategoryDescription !== undefined) {
            this.newCategoryDescription = params.newCategoryDescription;
        }
        if (params.newTagName !== undefined) {
            this.newTagName = params.newTagName;
        }
    }
    updateStateVars(params: CategoriesPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__categories.purgeDependencyOnElmtId(rmElmtId);
        this.__tags.purgeDependencyOnElmtId(rmElmtId);
        this.__currentTab.purgeDependencyOnElmtId(rmElmtId);
        this.__showAddCategoryDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__showAddTagDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__showDeleteConfirmDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__deleteType.purgeDependencyOnElmtId(rmElmtId);
        this.__deleteId.purgeDependencyOnElmtId(rmElmtId);
        this.__deleteName.purgeDependencyOnElmtId(rmElmtId);
        this.__newCategoryName.purgeDependencyOnElmtId(rmElmtId);
        this.__newCategoryDescription.purgeDependencyOnElmtId(rmElmtId);
        this.__newTagName.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__categories.aboutToBeDeleted();
        this.__tags.aboutToBeDeleted();
        this.__currentTab.aboutToBeDeleted();
        this.__showAddCategoryDialog.aboutToBeDeleted();
        this.__showAddTagDialog.aboutToBeDeleted();
        this.__showDeleteConfirmDialog.aboutToBeDeleted();
        this.__deleteType.aboutToBeDeleted();
        this.__deleteId.aboutToBeDeleted();
        this.__deleteName.aboutToBeDeleted();
        this.__newCategoryName.aboutToBeDeleted();
        this.__newCategoryDescription.aboutToBeDeleted();
        this.__newTagName.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __categories: ObservedPropertyObjectPU<Category[]>;
    get categories() {
        return this.__categories.get();
    }
    set categories(newValue: Category[]) {
        this.__categories.set(newValue);
    }
    private __tags: ObservedPropertyObjectPU<Tag[]>;
    get tags() {
        return this.__tags.get();
    }
    set tags(newValue: Tag[]) {
        this.__tags.set(newValue);
    }
    private __currentTab: ObservedPropertySimplePU<number>;
    get currentTab() {
        return this.__currentTab.get();
    }
    set currentTab(newValue: number) {
        this.__currentTab.set(newValue);
    }
    private __showAddCategoryDialog: ObservedPropertySimplePU<boolean>;
    get showAddCategoryDialog() {
        return this.__showAddCategoryDialog.get();
    }
    set showAddCategoryDialog(newValue: boolean) {
        this.__showAddCategoryDialog.set(newValue);
    }
    private __showAddTagDialog: ObservedPropertySimplePU<boolean>;
    get showAddTagDialog() {
        return this.__showAddTagDialog.get();
    }
    set showAddTagDialog(newValue: boolean) {
        this.__showAddTagDialog.set(newValue);
    }
    private __showDeleteConfirmDialog: ObservedPropertySimplePU<boolean>;
    get showDeleteConfirmDialog() {
        return this.__showDeleteConfirmDialog.get();
    }
    set showDeleteConfirmDialog(newValue: boolean) {
        this.__showDeleteConfirmDialog.set(newValue);
    }
    private __deleteType: ObservedPropertySimplePU<string>;
    get deleteType() {
        return this.__deleteType.get();
    }
    set deleteType(newValue: string) {
        this.__deleteType.set(newValue);
    }
    private __deleteId: ObservedPropertySimplePU<number>;
    get deleteId() {
        return this.__deleteId.get();
    }
    set deleteId(newValue: number) {
        this.__deleteId.set(newValue);
    }
    private __deleteName: ObservedPropertySimplePU<string>;
    get deleteName() {
        return this.__deleteName.get();
    }
    set deleteName(newValue: string) {
        this.__deleteName.set(newValue);
    }
    private __newCategoryName: ObservedPropertySimplePU<string>;
    get newCategoryName() {
        return this.__newCategoryName.get();
    }
    set newCategoryName(newValue: string) {
        this.__newCategoryName.set(newValue);
    }
    private __newCategoryDescription: ObservedPropertySimplePU<string>;
    get newCategoryDescription() {
        return this.__newCategoryDescription.get();
    }
    set newCategoryDescription(newValue: string) {
        this.__newCategoryDescription.set(newValue);
    }
    private __newTagName: ObservedPropertySimplePU<string>;
    get newTagName() {
        return this.__newTagName.get();
    }
    set newTagName(newValue: string) {
        this.__newTagName.set(newValue);
    }
    aboutToAppear(): void {
        this.loadCategories();
        this.loadTags();
    }
    async loadCategories(): Promise<void> {
        try {
            this.categories = await CategoryService.getCategories();
        }
        catch (e) {
            console.error('Failed to load categories: ' + JSON.stringify(e));
        }
    }
    async loadTags(): Promise<void> {
        try {
            this.tags = await TagService.getTags();
        }
        catch (e) {
            console.error('Failed to load tags: ' + JSON.stringify(e));
        }
    }
    async createCategory(): Promise<void> {
        if (!this.newCategoryName.trim()) {
            return;
        }
        try {
            await CategoryService.createCategory(this.newCategoryName.trim(), this.newCategoryDescription.trim() || undefined);
            this.showAddCategoryDialog = false;
            this.newCategoryName = '';
            this.newCategoryDescription = '';
            this.loadCategories();
        }
        catch (e) {
            console.error('Failed to create category: ' + JSON.stringify(e));
        }
    }
    async createTag(): Promise<void> {
        if (!this.newTagName.trim()) {
            return;
        }
        try {
            await TagService.createTag(this.newTagName.trim());
            this.showAddTagDialog = false;
            this.newTagName = '';
            this.loadTags();
        }
        catch (e) {
            console.error('Failed to create tag: ' + JSON.stringify(e));
        }
    }
    async confirmDelete(): Promise<void> {
        try {
            if (this.deleteType === 'category') {
                await CategoryService.deleteCategory(this.deleteId);
                this.loadCategories();
            }
            else {
                await TagService.deleteTag(this.deleteId);
                this.loadTags();
            }
            this.showDeleteConfirmDialog = false;
        }
        catch (e) {
            console.error('Failed to delete: ' + JSON.stringify(e));
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
            Image.onClick(() => {
                try {
                    navigateToTab(this.getUIContext(), 'pages/HomePage');
                }
                catch (e) {
                    console.error('Back failed: ' + JSON.stringify(e));
                }
            });
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('分类与标签');
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
            Tabs.create({ index: this.currentTab });
            Tabs.layoutWeight(1);
            Tabs.width('100%');
            Tabs.barMode(BarMode.Fixed);
            Tabs.barBackgroundColor('#FFFFFF');
            Tabs.animationDuration(0);
            Tabs.onChange((index: number) => {
                this.currentTab = index;
            });
        }, Tabs);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.CategoryTab.bind(this)();
            });
            TabContent.tabBar('分类管理');
        }, TabContent);
        TabContent.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TabContent.create(() => {
                this.TagTab.bind(this)();
            });
            TabContent.tabBar('标签管理');
        }, TabContent);
        TabContent.pop();
        Tabs.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showAddCategoryDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.AddCategoryDialog.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showAddTagDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.AddTagDialog.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showDeleteConfirmDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.DeleteConfirmDialog.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    CategoryTab(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 12, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`共 ${this.categories.length} 个分类`);
            Text.fontSize(13);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('新增分类');
            Button.height(32);
            Button.fontSize(13);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#007DFF');
            Button.borderRadius(16);
            Button.padding({ left: 12, right: 12 });
            Button.onClick(() => {
                this.newCategoryName = '';
                this.newCategoryDescription = '';
                this.showAddCategoryDialog = true;
            });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.categories.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无分类');
                        Text.fontSize(14);
                        Text.fontColor('#CCCCCC');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.layoutWeight(1);
                        List.width('100%');
                        List.divider({ strokeWidth: 0.5, color: '#E5E5E5', startMargin: 16, endMargin: 16 });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const category = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.width('100%');
                                        Row.padding({ left: 16, right: 16, top: 12, bottom: 12 });
                                        Row.alignItems(VerticalAlign.Center);
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.alignItems(HorizontalAlign.Start);
                                        Column.layoutWeight(1);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(category.name);
                                        Text.fontSize(15);
                                        Text.fontColor('#181818');
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        if (category.description) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(category.description);
                                                    Text.fontSize(12);
                                                    Text.fontColor('#999999');
                                                    Text.maxLines(1);
                                                    Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                                    Text.margin({ top: 4 });
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
                                        Text.create(`${category.comicCount} 漫画`);
                                        Text.fontSize(12);
                                        Text.fontColor('#999999');
                                        Text.margin({ right: 12 });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Image.create({ "id": 125831084, "type": 20000, params: [], "bundleName": "com.comicreader.harmony", "moduleName": "entry" });
                                        Image.width(20);
                                        Image.height(20);
                                        Image.fillColor('#FA2A2D');
                                        Image.onClick(() => {
                                            this.deleteType = 'category';
                                            this.deleteId = category.id;
                                            this.deleteName = category.name;
                                            this.showDeleteConfirmDialog = true;
                                        });
                                    }, Image);
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.categories, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    TagTab(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 12, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`共 ${this.tags.length} 个标签`);
            Text.fontSize(13);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('新增标签');
            Button.height(32);
            Button.fontSize(13);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#007DFF');
            Button.borderRadius(16);
            Button.padding({ left: 12, right: 12 });
            Button.onClick(() => {
                this.newTagName = '';
                this.showAddTagDialog = true;
            });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.tags.length === 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('暂无标签');
                        Text.fontSize(14);
                        Text.fontColor('#CCCCCC');
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        List.create();
                        List.layoutWeight(1);
                        List.width('100%');
                        List.divider({ strokeWidth: 0.5, color: '#E5E5E5', startMargin: 16, endMargin: 16 });
                    }, List);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const tag = _item;
                            {
                                const itemCreation = (elmtId, isInitialRender) => {
                                    ViewStackProcessor.StartGetAccessRecordingFor(elmtId);
                                    ListItem.create(deepRenderFunction, true);
                                    if (!isInitialRender) {
                                        ListItem.pop();
                                    }
                                    ViewStackProcessor.StopGetAccessRecording();
                                };
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    ListItem.create(deepRenderFunction, true);
                                };
                                const deepRenderFunction = (elmtId, isInitialRender) => {
                                    itemCreation(elmtId, isInitialRender);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Row.create();
                                        Row.width('100%');
                                        Row.padding({ left: 16, right: 16, top: 12, bottom: 12 });
                                        Row.alignItems(VerticalAlign.Center);
                                    }, Row);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(tag.name);
                                        Text.fontSize(15);
                                        Text.fontColor('#181818');
                                        Text.layoutWeight(1);
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(`${tag.comicCount} 漫画`);
                                        Text.fontSize(12);
                                        Text.fontColor('#999999');
                                        Text.margin({ right: 12 });
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Image.create({ "id": 125831084, "type": 20000, params: [], "bundleName": "com.comicreader.harmony", "moduleName": "entry" });
                                        Image.width(20);
                                        Image.height(20);
                                        Image.fillColor('#FA2A2D');
                                        Image.onClick(() => {
                                            this.deleteType = 'tag';
                                            this.deleteId = tag.id;
                                            this.deleteName = tag.name;
                                            this.showDeleteConfirmDialog = true;
                                        });
                                    }, Image);
                                    Row.pop();
                                    ListItem.pop();
                                };
                                this.observeComponentCreation2(itemCreation2, ListItem);
                                ListItem.pop();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.tags, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    List.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
    }
    AddCategoryDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#99000000');
            Column.justifyContent(FlexAlign.Center);
            Column.position({ x: 0, y: 0 });
            Column.zIndex(999);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('80%');
            Column.backgroundColor('#FFFFFF');
            Column.shadow({ radius: 6, color: '#10000000', offsetY: 1 });
            Column.borderRadius(16);
            Column.padding(24);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('新增分类');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#181818');
            Text.width('100%');
            Text.textAlign(TextAlign.Center);
            Text.margin({ bottom: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('名称');
            Text.fontSize(13);
            Text.fontColor('#999999');
            Text.width('100%');
            Text.margin({ bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.newCategoryName, placeholder: '输入分类名称' });
            TextInput.width('100%');
            TextInput.height(40);
            TextInput.fontColor('#181818');
            TextInput.backgroundColor('#F5F5F5');
            TextInput.onChange((value: string) => {
                this.newCategoryName = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('描述');
            Text.fontSize(13);
            Text.fontColor('#999999');
            Text.width('100%');
            Text.margin({ top: 12, bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.newCategoryDescription, placeholder: '输入分类描述（可选）' });
            TextInput.width('100%');
            TextInput.height(40);
            TextInput.fontColor('#181818');
            TextInput.backgroundColor('#F5F5F5');
            TextInput.onChange((value: string) => {
                this.newCategoryDescription = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 20 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.layoutWeight(1);
            Button.height(40);
            Button.fontSize(14);
            Button.fontColor('#999999');
            Button.backgroundColor('#F5F5F5');
            Button.borderRadius(20);
            Button.onClick(() => {
                this.showAddCategoryDialog = false;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('创建');
            Button.layoutWeight(1);
            Button.height(40);
            Button.fontSize(14);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#007DFF');
            Button.borderRadius(20);
            Button.margin({ left: 12 });
            Button.onClick(() => {
                this.createCategory();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        Column.pop();
    }
    AddTagDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#99000000');
            Column.justifyContent(FlexAlign.Center);
            Column.position({ x: 0, y: 0 });
            Column.zIndex(999);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('80%');
            Column.backgroundColor('#FFFFFF');
            Column.shadow({ radius: 6, color: '#10000000', offsetY: 1 });
            Column.borderRadius(16);
            Column.padding(24);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('新增标签');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#181818');
            Text.width('100%');
            Text.textAlign(TextAlign.Center);
            Text.margin({ bottom: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('名称');
            Text.fontSize(13);
            Text.fontColor('#999999');
            Text.width('100%');
            Text.margin({ bottom: 6 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.newTagName, placeholder: '输入标签名称' });
            TextInput.width('100%');
            TextInput.height(40);
            TextInput.fontColor('#181818');
            TextInput.backgroundColor('#F5F5F5');
            TextInput.onChange((value: string) => {
                this.newTagName = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ top: 20 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.layoutWeight(1);
            Button.height(40);
            Button.fontSize(14);
            Button.fontColor('#999999');
            Button.backgroundColor('#F5F5F5');
            Button.borderRadius(20);
            Button.onClick(() => {
                this.showAddTagDialog = false;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('创建');
            Button.layoutWeight(1);
            Button.height(40);
            Button.fontSize(14);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#007DFF');
            Button.borderRadius(20);
            Button.margin({ left: 12 });
            Button.onClick(() => {
                this.createTag();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        Column.pop();
    }
    DeleteConfirmDialog(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#99000000');
            Column.justifyContent(FlexAlign.Center);
            Column.position({ x: 0, y: 0 });
            Column.zIndex(999);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('80%');
            Column.backgroundColor('#FFFFFF');
            Column.shadow({ radius: 6, color: '#10000000', offsetY: 1 });
            Column.borderRadius(16);
            Column.padding(24);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('确认删除');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#181818');
            Text.width('100%');
            Text.textAlign(TextAlign.Center);
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`确定要删除${this.deleteType === 'category' ? '分类' : '标签'}「${this.deleteName}」吗？`);
            Text.fontSize(14);
            Text.fontColor('#999999');
            Text.width('100%');
            Text.textAlign(TextAlign.Center);
            Text.margin({ bottom: 20 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('取消');
            Button.layoutWeight(1);
            Button.height(40);
            Button.fontSize(14);
            Button.fontColor('#999999');
            Button.backgroundColor('#F5F5F5');
            Button.borderRadius(20);
            Button.onClick(() => {
                this.showDeleteConfirmDialog = false;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('删除');
            Button.layoutWeight(1);
            Button.height(40);
            Button.fontSize(14);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#EF4444');
            Button.borderRadius(20);
            Button.margin({ left: 12 });
            Button.onClick(() => {
                this.confirmDelete();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "CategoriesPage";
    }
}
registerNamedRoute(() => new CategoriesPage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/CategoriesPage", pageFullPath: "entry/src/main/ets/pages/CategoriesPage", integratedHsp: "false", moduleType: "followWithHap" });
