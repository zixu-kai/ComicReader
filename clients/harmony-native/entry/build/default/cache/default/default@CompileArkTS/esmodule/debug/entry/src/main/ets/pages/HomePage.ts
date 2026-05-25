if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface HomePage_Params {
    serverInfo?: ServerInfo | null;
    continueReadingComics?: Comic[];
    continueReadingBooks?: Book[];
    recentComics?: Comic[];
    randomComics?: Comic[];
    randomBooks?: Book[];
    currentTab?: number;
    isRefreshing?: boolean;
}
import { ComicQueryParams, BookQueryParams } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
import type { Comic, Book, ServerInfo, PaginatedResponse } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
import { ComicService, BookService, SystemService } from "@bundle:com.comicreader.harmony/entry/ets/service/ComicService";
import { ComicCard } from "@bundle:com.comicreader.harmony/entry/ets/components/ComicCard";
import { TabBar } from "@bundle:com.comicreader.harmony/entry/ets/components/TabBar";
import { navigateTo, navigateToTab, NavParams } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return bytes + ' B';
    }
    else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    }
    else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    else {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
}
class HomePage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__serverInfo = new ObservedPropertyObjectPU(null, this, "serverInfo");
        this.__continueReadingComics = new ObservedPropertyObjectPU([], this, "continueReadingComics");
        this.__continueReadingBooks = new ObservedPropertyObjectPU([], this, "continueReadingBooks");
        this.__recentComics = new ObservedPropertyObjectPU([], this, "recentComics");
        this.__randomComics = new ObservedPropertyObjectPU([], this, "randomComics");
        this.__randomBooks = new ObservedPropertyObjectPU([], this, "randomBooks");
        this.__currentTab = new ObservedPropertySimplePU(0, this, "currentTab");
        this.__isRefreshing = new ObservedPropertySimplePU(false, this, "isRefreshing");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: HomePage_Params) {
        if (params.serverInfo !== undefined) {
            this.serverInfo = params.serverInfo;
        }
        if (params.continueReadingComics !== undefined) {
            this.continueReadingComics = params.continueReadingComics;
        }
        if (params.continueReadingBooks !== undefined) {
            this.continueReadingBooks = params.continueReadingBooks;
        }
        if (params.recentComics !== undefined) {
            this.recentComics = params.recentComics;
        }
        if (params.randomComics !== undefined) {
            this.randomComics = params.randomComics;
        }
        if (params.randomBooks !== undefined) {
            this.randomBooks = params.randomBooks;
        }
        if (params.currentTab !== undefined) {
            this.currentTab = params.currentTab;
        }
        if (params.isRefreshing !== undefined) {
            this.isRefreshing = params.isRefreshing;
        }
    }
    updateStateVars(params: HomePage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__serverInfo.purgeDependencyOnElmtId(rmElmtId);
        this.__continueReadingComics.purgeDependencyOnElmtId(rmElmtId);
        this.__continueReadingBooks.purgeDependencyOnElmtId(rmElmtId);
        this.__recentComics.purgeDependencyOnElmtId(rmElmtId);
        this.__randomComics.purgeDependencyOnElmtId(rmElmtId);
        this.__randomBooks.purgeDependencyOnElmtId(rmElmtId);
        this.__currentTab.purgeDependencyOnElmtId(rmElmtId);
        this.__isRefreshing.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__serverInfo.aboutToBeDeleted();
        this.__continueReadingComics.aboutToBeDeleted();
        this.__continueReadingBooks.aboutToBeDeleted();
        this.__recentComics.aboutToBeDeleted();
        this.__randomComics.aboutToBeDeleted();
        this.__randomBooks.aboutToBeDeleted();
        this.__currentTab.aboutToBeDeleted();
        this.__isRefreshing.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __serverInfo: ObservedPropertyObjectPU<ServerInfo | null>;
    get serverInfo() {
        return this.__serverInfo.get();
    }
    set serverInfo(newValue: ServerInfo | null) {
        this.__serverInfo.set(newValue);
    }
    private __continueReadingComics: ObservedPropertyObjectPU<Comic[]>;
    get continueReadingComics() {
        return this.__continueReadingComics.get();
    }
    set continueReadingComics(newValue: Comic[]) {
        this.__continueReadingComics.set(newValue);
    }
    private __continueReadingBooks: ObservedPropertyObjectPU<Book[]>;
    get continueReadingBooks() {
        return this.__continueReadingBooks.get();
    }
    set continueReadingBooks(newValue: Book[]) {
        this.__continueReadingBooks.set(newValue);
    }
    private __recentComics: ObservedPropertyObjectPU<Comic[]>;
    get recentComics() {
        return this.__recentComics.get();
    }
    set recentComics(newValue: Comic[]) {
        this.__recentComics.set(newValue);
    }
    private __randomComics: ObservedPropertyObjectPU<Comic[]>;
    get randomComics() {
        return this.__randomComics.get();
    }
    set randomComics(newValue: Comic[]) {
        this.__randomComics.set(newValue);
    }
    private __randomBooks: ObservedPropertyObjectPU<Book[]>;
    get randomBooks() {
        return this.__randomBooks.get();
    }
    set randomBooks(newValue: Book[]) {
        this.__randomBooks.set(newValue);
    }
    private __currentTab: ObservedPropertySimplePU<number>;
    get currentTab() {
        return this.__currentTab.get();
    }
    set currentTab(newValue: number) {
        this.__currentTab.set(newValue);
    }
    private __isRefreshing: ObservedPropertySimplePU<boolean>;
    get isRefreshing() {
        return this.__isRefreshing.get();
    }
    set isRefreshing(newValue: boolean) {
        this.__isRefreshing.set(newValue);
    }
    aboutToAppear(): void {
        this.loadAll();
    }
    async loadAll(): Promise<void> {
        this.loadServerInfo();
        this.loadContinueReadingComics();
        this.loadContinueReadingBooks();
        this.loadRecentComics();
        this.loadRandomComics();
        this.loadRandomBooks();
    }
    async loadServerInfo(): Promise<void> {
        try {
            this.serverInfo = await SystemService.getInfo();
        }
        catch (e) {
            console.error('Failed to load server info: ' + JSON.stringify(e));
        }
    }
    async loadContinueReadingComics(): Promise<void> {
        try {
            const comics = await ComicService.getContinueReading();
            this.continueReadingComics = comics.slice(0, 10);
        }
        catch (e) {
            console.error('Failed to load continue reading comics: ' + JSON.stringify(e));
        }
    }
    async loadContinueReadingBooks(): Promise<void> {
        try {
            let params = new BookQueryParams();
            params.readingStatus = 'reading';
            params.sort = 'lastReadAt';
            params.order = 'desc';
            params.pageSize = 10;
            const res: PaginatedResponse<Book> = await BookService.getBooks(params);
            this.continueReadingBooks = res.data;
        }
        catch (e) {
            console.error('Failed to load continue reading books: ' + JSON.stringify(e));
        }
    }
    async loadRecentComics(): Promise<void> {
        try {
            let params = new ComicQueryParams();
            params.sort = 'createdAt';
            params.order = 'desc';
            params.pageSize = 12;
            const res: PaginatedResponse<Comic> = await ComicService.getComics(params);
            this.recentComics = res.data;
        }
        catch (e) {
            console.error('Failed to load recent comics: ' + JSON.stringify(e));
        }
    }
    async loadRandomComics(): Promise<void> {
        try {
            this.randomComics = await ComicService.getRandomComics(6);
        }
        catch (e) {
            console.error('Failed to load random comics: ' + JSON.stringify(e));
        }
    }
    async loadRandomBooks(): Promise<void> {
        try {
            this.randomBooks = await BookService.getRandomBooks(3);
        }
        catch (e) {
            console.error('Failed to load random books: ' + JSON.stringify(e));
        }
    }
    onTabChange(tab: number): void {
        if (tab === 1) {
            navigateToTab(this.getUIContext(), 'pages/LibraryPage');
        }
        else if (tab === 2) {
            navigateToTab(this.getUIContext(), 'pages/BookLibraryPage');
        }
        else if (tab === 3) {
            navigateToTab(this.getUIContext(), 'pages/CategoriesPage');
        }
        else if (tab === 4) {
            navigateToTab(this.getUIContext(), 'pages/BookmarksPage');
        }
        else if (tab === 5) {
            navigateToTab(this.getUIContext(), 'pages/RandomPage');
        }
        else if (tab === 6) {
            navigateToTab(this.getUIContext(), 'pages/SettingsPage');
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
            Refresh.create({ refreshing: { value: this.isRefreshing, changeEvent: newValue => { this.isRefreshing = newValue; } } });
            Refresh.onRefreshing(async () => {
                await this.loadAll();
                this.isRefreshing = false;
            });
        }, Refresh);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.layoutWeight(1);
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ bottom: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.continueReadingComics.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.ContinueReadingSection.bind(this)();
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
            if (this.continueReadingBooks.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.ContinueReadingBooksSection.bind(this)();
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
            if (this.recentComics.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.RecentComicsSection.bind(this)();
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
            if (this.randomComics.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.RandomComicsSection.bind(this)();
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
            if (this.randomBooks.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.RandomBooksSection.bind(this)();
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
            if (this.serverInfo) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.ServerStatsSection.bind(this)();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Column.pop();
        Scroll.pop();
        Refresh.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new TabBar(this, { currentTab: this.__currentTab, onTabClick: (tab: number) => {
                            this.onTabChange(tab);
                        } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 157, col: 7 });
                    ViewPU.create(componentCall);
                    let paramsLambda = () => {
                        return {
                            currentTab: this.currentTab,
                            onTabClick: (tab: number) => {
                                this.onTabChange(tab);
                            }
                        };
                    };
                    componentCall.paramsGenerator_ = paramsLambda;
                }
                else {
                    this.updateStateVarsOfChildByElmtId(elmtId, {});
                }
            }, { name: "TabBar" });
        }
        Column.pop();
    }
    ServerStatsSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.serverInfo) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding({ left: 16, right: 16, top: 16, bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('服务器状态');
                        Text.fontSize(18);
                        Text.fontColor('#181818');
                        Text.fontWeight(FontWeight.Bold);
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Grid.create();
                        Grid.columnsTemplate('1fr 1fr');
                        Grid.rowsGap(8);
                        Grid.columnsGap(8);
                        Grid.width('100%');
                        Grid.padding({ left: 16, right: 16 });
                    }, Grid);
                    {
                        const itemCreation2 = (elmtId, isInitialRender) => {
                            GridItem.create(() => { }, false);
                        };
                        const observedDeepRender = () => {
                            this.observeComponentCreation2(itemCreation2, GridItem);
                            this.StatCard.bind(this)('漫画总数', `${this.serverInfo.comicCount}`);
                            GridItem.pop();
                        };
                        observedDeepRender();
                    }
                    {
                        const itemCreation2 = (elmtId, isInitialRender) => {
                            GridItem.create(() => { }, false);
                        };
                        const observedDeepRender = () => {
                            this.observeComponentCreation2(itemCreation2, GridItem);
                            this.StatCard.bind(this)('分类数', `${this.serverInfo.categoryCount}`);
                            GridItem.pop();
                        };
                        observedDeepRender();
                    }
                    {
                        const itemCreation2 = (elmtId, isInitialRender) => {
                            GridItem.create(() => { }, false);
                        };
                        const observedDeepRender = () => {
                            this.observeComponentCreation2(itemCreation2, GridItem);
                            this.StatCard.bind(this)('标签数', `${this.serverInfo.tagCount}`);
                            GridItem.pop();
                        };
                        observedDeepRender();
                    }
                    {
                        const itemCreation2 = (elmtId, isInitialRender) => {
                            GridItem.create(() => { }, false);
                        };
                        const observedDeepRender = () => {
                            this.observeComponentCreation2(itemCreation2, GridItem);
                            this.StatCard.bind(this)('总大小', formatFileSize(this.serverInfo.totalSize));
                            GridItem.pop();
                        };
                        observedDeepRender();
                    }
                    Grid.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
    }
    StatCard(label: string, value: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(12);
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(12);
            Column.alignItems(HorizontalAlign.Start);
            Column.shadow({ radius: 8, color: '#10000000', offsetY: 2 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(label);
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(value);
            Text.fontSize(22);
            Text.fontColor('#181818');
            Text.fontWeight(FontWeight.Bold);
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
    }
    ContinueReadingSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 16, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('继续阅读');
            Text.fontSize(18);
            Text.fontColor('#181818');
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('查看全部');
            Text.fontSize(14);
            Text.fontColor('#007DFF');
            Text.onClick(() => {
                navigateToTab(this.getUIContext(), 'pages/LibraryPage');
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.scrollable(ScrollDirection.Horizontal);
            Scroll.width('100%');
            Scroll.padding({ left: 16, right: 16 });
            Scroll.scrollBar(BarState.Off);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const comic = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Column.create();
                    Column.width(140);
                    Column.margin({ right: 12 });
                }, Column);
                {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        if (isInitialRender) {
                            let componentCall = new ComicCard(this, {
                                comic: comic,
                                onTap: (c: Comic) => {
                                    let p = new NavParams();
                                    p.comicId = c.id;
                                    navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p);
                                }
                            }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 251, col: 15 });
                            ViewPU.create(componentCall);
                            let paramsLambda = () => {
                                return {
                                    comic: comic,
                                    onTap: (c: Comic) => {
                                        let p = new NavParams();
                                        p.comicId = c.id;
                                        navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p);
                                    }
                                };
                            };
                            componentCall.paramsGenerator_ = paramsLambda;
                        }
                        else {
                            this.updateStateVarsOfChildByElmtId(elmtId, {
                                comic: comic
                            });
                        }
                    }, { name: "ComicCard" });
                }
                Column.pop();
            };
            this.forEachUpdateFunction(elmtId, this.continueReadingComics, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Scroll.pop();
        Column.pop();
    }
    ContinueReadingBooksSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 16, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('继续阅读 - 图书');
            Text.fontSize(18);
            Text.fontColor('#181818');
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('查看全部');
            Text.fontSize(14);
            Text.fontColor('#007DFF');
            Text.onClick(() => {
                navigateToTab(this.getUIContext(), 'pages/BookLibraryPage');
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const book = _item;
                this.BookListItem.bind(this)(book);
            };
            this.forEachUpdateFunction(elmtId, this.continueReadingBooks, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        Column.pop();
    }
    RecentComicsSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 16, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('最近添加');
            Text.fontSize(18);
            Text.fontColor('#181818');
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('查看全部');
            Text.fontSize(14);
            Text.fontColor('#007DFF');
            Text.onClick(() => {
                navigateToTab(this.getUIContext(), 'pages/LibraryPage');
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Grid.create();
            Grid.columnsTemplate('1fr 1fr 1fr');
            Grid.rowsGap(8);
            Grid.columnsGap(8);
            Grid.width('100%');
            Grid.padding({ left: 12, right: 12 });
        }, Grid);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const comic = _item;
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        GridItem.create(() => { }, false);
                        GridItem.padding(4);
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, GridItem);
                        {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                if (isInitialRender) {
                                    let componentCall = new ComicCard(this, {
                                        comic: comic,
                                        onTap: (c: Comic) => {
                                            let p = new NavParams();
                                            p.comicId = c.id;
                                            navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p);
                                        }
                                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 325, col: 13 });
                                    ViewPU.create(componentCall);
                                    let paramsLambda = () => {
                                        return {
                                            comic: comic,
                                            onTap: (c: Comic) => {
                                                let p = new NavParams();
                                                p.comicId = c.id;
                                                navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p);
                                            }
                                        };
                                    };
                                    componentCall.paramsGenerator_ = paramsLambda;
                                }
                                else {
                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                        comic: comic
                                    });
                                }
                            }, { name: "ComicCard" });
                        }
                        GridItem.pop();
                    };
                    observedDeepRender();
                }
            };
            this.forEachUpdateFunction(elmtId, this.recentComics, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Grid.pop();
        Column.pop();
    }
    RandomComicsSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 16, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('随机推荐');
            Text.fontSize(18);
            Text.fontColor('#181818');
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('换一批');
            Text.fontSize(14);
            Text.fontColor('#007DFF');
            Text.onClick(() => {
                this.loadRandomComics();
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Grid.create();
            Grid.columnsTemplate('1fr 1fr 1fr');
            Grid.rowsGap(8);
            Grid.columnsGap(8);
            Grid.width('100%');
            Grid.padding({ left: 12, right: 12 });
        }, Grid);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const comic = _item;
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        GridItem.create(() => { }, false);
                        GridItem.padding(4);
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, GridItem);
                        {
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                if (isInitialRender) {
                                    let componentCall = new ComicCard(this, {
                                        comic: comic,
                                        onTap: (c: Comic) => {
                                            let p = new NavParams();
                                            p.comicId = c.id;
                                            navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p);
                                        }
                                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/HomePage.ets", line: 367, col: 13 });
                                    ViewPU.create(componentCall);
                                    let paramsLambda = () => {
                                        return {
                                            comic: comic,
                                            onTap: (c: Comic) => {
                                                let p = new NavParams();
                                                p.comicId = c.id;
                                                navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p);
                                            }
                                        };
                                    };
                                    componentCall.paramsGenerator_ = paramsLambda;
                                }
                                else {
                                    this.updateStateVarsOfChildByElmtId(elmtId, {
                                        comic: comic
                                    });
                                }
                            }, { name: "ComicCard" });
                        }
                        GridItem.pop();
                    };
                    observedDeepRender();
                }
            };
            this.forEachUpdateFunction(elmtId, this.randomComics, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Grid.pop();
        Column.pop();
    }
    RandomBooksSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 16, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('随机图书推荐');
            Text.fontSize(18);
            Text.fontColor('#181818');
            Text.fontWeight(FontWeight.Bold);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('查看全部');
            Text.fontSize(14);
            Text.fontColor('#007DFF');
            Text.onClick(() => {
                navigateToTab(this.getUIContext(), 'pages/BookLibraryPage');
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const book = _item;
                this.BookListItem.bind(this)(book);
            };
            this.forEachUpdateFunction(elmtId, this.randomBooks, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        Column.pop();
    }
    BookListItem(book: Book, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.backgroundColor('#FFFFFF');
            Row.borderRadius(12);
            Row.padding(8);
            Row.margin({ bottom: 8 });
            Row.shadow({ radius: 8, color: '#10000000', offsetY: 2 });
            Row.onClick(() => {
                let p = new NavParams();
                p.bookId = book.id;
                navigateTo(this.getUIContext(), 'pages/BookDetailPage', p);
            });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (book.coverPath) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create(BookService.getCoverUrl(book.id));
                        Image.width(56);
                        Image.height(76);
                        Image.objectFit(ImageFit.Cover);
                        Image.borderRadius(6);
                    }, Image);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width(56);
                        Column.height(76);
                        Column.linearGradient({
                            direction: GradientDirection.RightBottom,
                            colors: [['#007DFF', 0.0], ['#0052CC', 1.0]]
                        });
                        Column.borderRadius(6);
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                        Column.padding(4);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(book.title);
                        Text.fontSize(11);
                        Text.fontColor('#FFFFFF');
                        Text.maxLines(2);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
            Column.padding({ left: 12 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(book.title);
            Text.fontSize(14);
            Text.fontColor('#181818');
            Text.maxLines(2);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(book.author || '未知作者');
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.maxLines(1);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.margin({ top: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(book.format.toUpperCase());
            Text.fontSize(10);
            Text.fontColor('#FFFFFF');
            Text.backgroundColor(book.format === 'pdf' ? '#FA2A2D' : book.format === 'epub' ? '#45A848' : '#F5A623');
            Text.borderRadius(4);
            Text.padding({ left: 4, right: 4, top: 2, bottom: 2 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (book.readingProgress) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${Math.round(book.readingProgress.percentage * 100)}%`);
                        Text.fontSize(11);
                        Text.fontColor('#999999');
                        Text.margin({ left: 8 });
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
        Row.pop();
        Column.pop();
        Row.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "HomePage";
    }
}
registerNamedRoute(() => new HomePage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/HomePage", pageFullPath: "entry/src/main/ets/pages/HomePage", integratedHsp: "false", moduleType: "followWithHap" });
