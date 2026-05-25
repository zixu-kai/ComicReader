if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BookmarksPage_Params {
    bookmarks?: BookmarkItem[];
    comics?: Comic[];
    books?: Book[];
    loading?: boolean;
    activeTab?: number;
    currentTab?: number;
}
import type { Comic, Book, BookmarkItem } from '../model/ComicModels';
import { ComicService, BookService, BookmarkService } from "@bundle:com.comicreader.harmony/entry/ets/service/ComicService";
import { TabBar } from "@bundle:com.comicreader.harmony/entry/ets/components/TabBar";
import { navigateTo, navigateToTab, NavParams } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
class BookmarksPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__bookmarks = new ObservedPropertyObjectPU([], this, "bookmarks");
        this.__comics = new ObservedPropertyObjectPU([], this, "comics");
        this.__books = new ObservedPropertyObjectPU([], this, "books");
        this.__loading = new ObservedPropertySimplePU(true, this, "loading");
        this.__activeTab = new ObservedPropertySimplePU(0, this, "activeTab");
        this.__currentTab = new ObservedPropertySimplePU(4, this, "currentTab");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BookmarksPage_Params) {
        if (params.bookmarks !== undefined) {
            this.bookmarks = params.bookmarks;
        }
        if (params.comics !== undefined) {
            this.comics = params.comics;
        }
        if (params.books !== undefined) {
            this.books = params.books;
        }
        if (params.loading !== undefined) {
            this.loading = params.loading;
        }
        if (params.activeTab !== undefined) {
            this.activeTab = params.activeTab;
        }
        if (params.currentTab !== undefined) {
            this.currentTab = params.currentTab;
        }
    }
    updateStateVars(params: BookmarksPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__bookmarks.purgeDependencyOnElmtId(rmElmtId);
        this.__comics.purgeDependencyOnElmtId(rmElmtId);
        this.__books.purgeDependencyOnElmtId(rmElmtId);
        this.__loading.purgeDependencyOnElmtId(rmElmtId);
        this.__activeTab.purgeDependencyOnElmtId(rmElmtId);
        this.__currentTab.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__bookmarks.aboutToBeDeleted();
        this.__comics.aboutToBeDeleted();
        this.__books.aboutToBeDeleted();
        this.__loading.aboutToBeDeleted();
        this.__activeTab.aboutToBeDeleted();
        this.__currentTab.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __bookmarks: ObservedPropertyObjectPU<BookmarkItem[]>;
    get bookmarks() {
        return this.__bookmarks.get();
    }
    set bookmarks(newValue: BookmarkItem[]) {
        this.__bookmarks.set(newValue);
    }
    private __comics: ObservedPropertyObjectPU<Comic[]>;
    get comics() {
        return this.__comics.get();
    }
    set comics(newValue: Comic[]) {
        this.__comics.set(newValue);
    }
    private __books: ObservedPropertyObjectPU<Book[]>;
    get books() {
        return this.__books.get();
    }
    set books(newValue: Book[]) {
        this.__books.set(newValue);
    }
    private __loading: ObservedPropertySimplePU<boolean>;
    get loading() {
        return this.__loading.get();
    }
    set loading(newValue: boolean) {
        this.__loading.set(newValue);
    }
    private __activeTab: ObservedPropertySimplePU<number>;
    get activeTab() {
        return this.__activeTab.get();
    }
    set activeTab(newValue: number) {
        this.__activeTab.set(newValue);
    }
    private __currentTab: ObservedPropertySimplePU<number>;
    get currentTab() {
        return this.__currentTab.get();
    }
    set currentTab(newValue: number) {
        this.__currentTab.set(newValue);
    }
    aboutToAppear(): void {
        setTimeout(() => {
            if (this.loading) {
                this.loading = false;
            }
        }, 8000);
        this.loadBookmarks();
    }
    async loadBookmarks(): Promise<void> {
        try {
            const bmList: BookmarkItem[] = await BookmarkService.getBookmarks();
            this.bookmarks = bmList;
            const allComicIds: number[] = [];
            const allBookIds: number[] = [];
            for (let i = 0; i < bmList.length; i++) {
                const b = bmList[i];
                if (b.comicIds && b.comicIds.length > 0) {
                    for (let j = 0; j < b.comicIds.length; j++) {
                        allComicIds.push(b.comicIds[j]);
                    }
                }
                if (b.bookIds && b.bookIds.length > 0) {
                    for (let k = 0; k < b.bookIds.length; k++) {
                        allBookIds.push(b.bookIds[k]);
                    }
                }
            }
            if (allComicIds.length === 0 && allBookIds.length === 0) {
                this.loading = false;
                return;
            }
            this.comics = [];
            for (let id of allComicIds) {
                try {
                    const comic: Comic = await ComicService.getComic(id);
                    if (comic) {
                        this.comics.push(comic);
                    }
                }
                catch (e) {
                    console.error('Failed to load comic ' + id + ': ' + JSON.stringify(e));
                }
            }
            this.books = [];
            for (let id of allBookIds) {
                try {
                    const book: Book = await BookService.getBook(id);
                    if (book) {
                        this.books.push(book);
                    }
                }
                catch (e) {
                    console.error('Failed to load book ' + id + ': ' + JSON.stringify(e));
                }
            }
        }
        catch (e) {
            console.error('Failed to load bookmarks: ' + JSON.stringify(e));
        }
        finally {
            this.loading = false;
        }
    }
    onTabChange(tab: number): void {
        if (tab === 0) {
            navigateToTab(this.getUIContext(), 'pages/HomePage');
        }
        else if (tab === 1) {
            navigateToTab(this.getUIContext(), 'pages/LibraryPage');
        }
        else if (tab === 2) {
            navigateToTab(this.getUIContext(), 'pages/BookLibraryPage');
        }
        else if (tab === 3) {
            navigateToTab(this.getUIContext(), 'pages/CategoriesPage');
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
            Row.create();
            Row.width('100%');
            Row.height(56);
            Row.padding({ left: 20, right: 20 });
            Row.alignItems(VerticalAlign.Center);
            Row.backgroundColor('#FFFFFF');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('我的收藏');
            Text.fontSize(20);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#181818');
            Text.layoutWeight(1);
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.loading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.width('100%');
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.width(36);
                        LoadingProgress.height(36);
                        LoadingProgress.color('#007DFF');
                    }, LoadingProgress);
                    Column.pop();
                });
            }
            else if (this.comics.length === 0 && this.books.length === 0) {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.width('100%');
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('📌');
                        Text.fontSize(56);
                        Text.margin({ bottom: 16 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('还没有收藏任何内容');
                        Text.fontSize(17);
                        Text.fontColor('#999999');
                        Text.fontWeight(FontWeight.Medium);
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('浏览漫画或图书时点击收藏按钮即可添加');
                        Text.fontSize(14);
                        Text.fontColor('#CCCCCC');
                        Text.margin({ top: 8 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(2, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.comics.length > 0 && this.books.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Row.create();
                                    Row.width('100%');
                                    Row.padding({ left: 20, right: 20, top: 4, bottom: 0 });
                                    Row.border({
                                        width: { bottom: 0.5 },
                                        color: '#E5E5E5'
                                    });
                                }, Row);
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('漫画');
                                    Text.fontSize(13);
                                    Text.fontColor(this.activeTab === 0 ? '#007DFF' : '#999999');
                                    Text.fontWeight(this.activeTab === 0 ? FontWeight.Medium : FontWeight.Regular);
                                    Text.border({
                                        width: this.activeTab === 0 ? 2 : 0,
                                        color: '#007DFF',
                                        style: BorderStyle.Solid
                                    });
                                    Text.borderRadius(0);
                                    Text.padding({ bottom: 8 });
                                    Text.margin({ right: 24 });
                                    Text.onClick(() => { this.activeTab = 0; });
                                }, Text);
                                Text.pop();
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create(`图书 · ${this.books.length}`);
                                    Text.fontSize(13);
                                    Text.fontColor(this.activeTab === 1 ? '#007DFF' : '#999999');
                                    Text.fontWeight(this.activeTab === 1 ? FontWeight.Medium : FontWeight.Regular);
                                    Text.border({
                                        width: this.activeTab === 1 ? 2 : 0,
                                        color: '#007DFF',
                                        style: BorderStyle.Solid
                                    });
                                    Text.borderRadius(0);
                                    Text.padding({ bottom: 8 });
                                    Text.onClick(() => { this.activeTab = 1; });
                                }, Text);
                                Text.pop();
                                Row.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.layoutWeight(1);
                        Scroll.width('100%');
                        Scroll.scrollBar(BarState.Off);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.activeTab === 0 && this.comics.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.ComicGrid.bind(this)();
                            });
                        }
                        else if (this.activeTab === 1 && this.books.length > 0) {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.BookGrid.bind(this)();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(2, () => {
                            });
                        }
                    }, If);
                    If.pop();
                    Scroll.pop();
                });
            }
        }, If);
        If.pop();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new TabBar(this, { currentTab: this.__currentTab, onTabClick: (tab: number) => {
                            this.onTabChange(tab);
                        } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/BookmarksPage.ets", line: 193, col: 7 });
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
    ComicGrid(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Grid.create();
            Grid.columnsTemplate('1fr 1fr 1fr');
            Grid.rowsGap(4);
            Grid.columnsGap(4);
            Grid.width('100%');
            Grid.padding({ left: 12, right: 12, top: 12 });
        }, Grid);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const comic = _item;
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        GridItem.create(() => { }, false);
                        GridItem.padding(5);
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, GridItem);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create();
                            Column.width('100%');
                            Column.backgroundColor('#FFFFFF');
                            Column.borderRadius(12);
                            Column.shadow({
                                radius: 8,
                                color: '#15000000',
                                offsetX: 0,
                                offsetY: 2
                            });
                            Column.onClick(() => {
                                let p = new NavParams();
                                p.comicId = comic.id;
                                navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p);
                            });
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Stack.create();
                            Stack.width('100%');
                            Stack.height(170);
                        }, Stack);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (comic.coverPath) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Image.create(ComicService.getCoverUrl(comic.id));
                                        Image.width('100%');
                                        Image.height(170);
                                        Image.objectFit(ImageFit.Cover);
                                        Image.borderRadius({ topLeft: 12, topRight: 12 });
                                    }, Image);
                                });
                            }
                            else {
                                this.ifElseBranchUpdateFunction(1, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.width('100%');
                                        Column.height(170);
                                        Column.linearGradient({
                                            direction: GradientDirection.RightBottom,
                                            colors: [['#007DFF', 0.0], ['#0052CC', 1.0]]
                                        });
                                        Column.borderRadius({ topLeft: 12, topRight: 12 });
                                        Column.justifyContent(FlexAlign.Center);
                                        Column.alignItems(HorizontalAlign.Center);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(comic.title);
                                        Text.fontSize(14);
                                        Text.fontColor('#FFFFFF');
                                        Text.fontWeight(FontWeight.Medium);
                                        Text.maxLines(3);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        Text.textAlign(TextAlign.Center);
                                        Text.padding({ left: 10, right: 10 });
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                });
                            }
                        }, If);
                        If.pop();
                        Stack.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create();
                            Column.padding({ left: 10, right: 10, top: 10, bottom: 12 });
                            Column.alignItems(HorizontalAlign.Start);
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(comic.title);
                            Text.fontSize(14);
                            Text.fontColor('#181818');
                            Text.fontWeight(FontWeight.Medium);
                            Text.maxLines(2);
                            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                            Text.width('100%');
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (comic.author) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(comic.author);
                                        Text.fontSize(12);
                                        Text.fontColor('#999999');
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        Text.width('100%');
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
                        Column.pop();
                        GridItem.pop();
                    };
                    observedDeepRender();
                }
            };
            this.forEachUpdateFunction(elmtId, this.comics, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Grid.pop();
    }
    BookGrid(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Grid.create();
            Grid.columnsTemplate('1fr 1fr 1fr');
            Grid.rowsGap(4);
            Grid.columnsGap(4);
            Grid.width('100%');
            Grid.padding({ left: 12, right: 12, top: 12 });
        }, Grid);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const book = _item;
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        GridItem.create(() => { }, false);
                        GridItem.padding(5);
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, GridItem);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create();
                            Column.width('100%');
                            Column.backgroundColor('#FFFFFF');
                            Column.borderRadius(12);
                            Column.shadow({
                                radius: 8,
                                color: '#15000000',
                                offsetX: 0,
                                offsetY: 2
                            });
                            Column.onClick(() => {
                                let p = new NavParams();
                                p.bookId = book.id;
                                navigateTo(this.getUIContext(), 'pages/BookDetailPage', p);
                            });
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Stack.create();
                            Stack.width('100%');
                            Stack.height(170);
                        }, Stack);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (book.coverPath) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Image.create(BookService.getCoverUrl(book.id));
                                        Image.width('100%');
                                        Image.height(170);
                                        Image.objectFit(ImageFit.Cover);
                                        Image.borderRadius({ topLeft: 12, topRight: 12 });
                                    }, Image);
                                });
                            }
                            else {
                                this.ifElseBranchUpdateFunction(1, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.width('100%');
                                        Column.height(170);
                                        Column.linearGradient({
                                            direction: GradientDirection.RightBottom,
                                            colors: [['#007DFF', 0.0], ['#0052CC', 1.0]]
                                        });
                                        Column.borderRadius({ topLeft: 12, topRight: 12 });
                                        Column.justifyContent(FlexAlign.Center);
                                        Column.alignItems(HorizontalAlign.Center);
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(book.title);
                                        Text.fontSize(14);
                                        Text.fontColor('#FFFFFF');
                                        Text.fontWeight(FontWeight.Medium);
                                        Text.maxLines(3);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        Text.textAlign(TextAlign.Center);
                                        Text.padding({ left: 10, right: 10 });
                                    }, Text);
                                    Text.pop();
                                    Column.pop();
                                });
                            }
                        }, If);
                        If.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(book.format.toUpperCase());
                            Text.fontSize(10);
                            Text.fontWeight(FontWeight.Medium);
                            Text.fontColor('#FFFFFF');
                            Text.backgroundColor(book.format === 'pdf' ? '#FA2A2D' : book.format === 'epub' ? '#45A848' : '#F5A623');
                            Text.borderRadius(4);
                            Text.padding({ left: 5, right: 5, top: 2, bottom: 2 });
                            Text.position({ x: '68%', y: 10 });
                        }, Text);
                        Text.pop();
                        Stack.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Column.create();
                            Column.padding({ left: 10, right: 10, top: 10, bottom: 12 });
                            Column.alignItems(HorizontalAlign.Start);
                        }, Column);
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            Text.create(book.title);
                            Text.fontSize(14);
                            Text.fontColor('#181818');
                            Text.fontWeight(FontWeight.Medium);
                            Text.maxLines(2);
                            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                            Text.width('100%');
                        }, Text);
                        Text.pop();
                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                            If.create();
                            if (book.author) {
                                this.ifElseBranchUpdateFunction(0, () => {
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(book.author);
                                        Text.fontSize(12);
                                        Text.fontColor('#999999');
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        Text.width('100%');
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
                        Column.pop();
                        GridItem.pop();
                    };
                    observedDeepRender();
                }
            };
            this.forEachUpdateFunction(elmtId, this.books, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Grid.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "BookmarksPage";
    }
}
registerNamedRoute(() => new BookmarksPage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/BookmarksPage", pageFullPath: "entry/src/main/ets/pages/BookmarksPage", integratedHsp: "false", moduleType: "followWithHap" });
