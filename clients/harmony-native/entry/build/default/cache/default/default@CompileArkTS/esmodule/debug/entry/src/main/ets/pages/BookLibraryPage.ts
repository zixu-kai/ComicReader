if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BookLibraryPage_Params {
    books?: Book[];
    tags?: Tag[];
    currentTab?: number;
    searchQuery?: string;
    selectedTagId?: number;
    selectedFormat?: string;
    sortField?: string;
    sortOrder?: string;
    currentPage?: number;
    totalPages?: number;
    totalBooks?: number;
    isRefreshing?: boolean;
    isLoadingMore?: boolean;
    showFilter?: boolean;
}
import { BookQueryParams } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
import type { Book, PaginatedResponse, Tag } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
import { BookService, TagService } from "@bundle:com.comicreader.harmony/entry/ets/service/ComicService";
import { TabBar } from "@bundle:com.comicreader.harmony/entry/ets/components/TabBar";
import { Constants, navigateTo, navigateToTab, NavParams } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
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
class BookLibraryPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__books = new ObservedPropertyObjectPU([], this, "books");
        this.__tags = new ObservedPropertyObjectPU([], this, "tags");
        this.__currentTab = new ObservedPropertySimplePU(2, this, "currentTab");
        this.__searchQuery = new ObservedPropertySimplePU('', this, "searchQuery");
        this.__selectedTagId = new ObservedPropertySimplePU(0, this, "selectedTagId");
        this.__selectedFormat = new ObservedPropertySimplePU('', this, "selectedFormat");
        this.__sortField = new ObservedPropertySimplePU('createdAt', this, "sortField");
        this.__sortOrder = new ObservedPropertySimplePU('desc', this, "sortOrder");
        this.__currentPage = new ObservedPropertySimplePU(1, this, "currentPage");
        this.__totalPages = new ObservedPropertySimplePU(1, this, "totalPages");
        this.__totalBooks = new ObservedPropertySimplePU(0, this, "totalBooks");
        this.__isRefreshing = new ObservedPropertySimplePU(false, this, "isRefreshing");
        this.__isLoadingMore = new ObservedPropertySimplePU(false, this, "isLoadingMore");
        this.__showFilter = new ObservedPropertySimplePU(false, this, "showFilter");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BookLibraryPage_Params) {
        if (params.books !== undefined) {
            this.books = params.books;
        }
        if (params.tags !== undefined) {
            this.tags = params.tags;
        }
        if (params.currentTab !== undefined) {
            this.currentTab = params.currentTab;
        }
        if (params.searchQuery !== undefined) {
            this.searchQuery = params.searchQuery;
        }
        if (params.selectedTagId !== undefined) {
            this.selectedTagId = params.selectedTagId;
        }
        if (params.selectedFormat !== undefined) {
            this.selectedFormat = params.selectedFormat;
        }
        if (params.sortField !== undefined) {
            this.sortField = params.sortField;
        }
        if (params.sortOrder !== undefined) {
            this.sortOrder = params.sortOrder;
        }
        if (params.currentPage !== undefined) {
            this.currentPage = params.currentPage;
        }
        if (params.totalPages !== undefined) {
            this.totalPages = params.totalPages;
        }
        if (params.totalBooks !== undefined) {
            this.totalBooks = params.totalBooks;
        }
        if (params.isRefreshing !== undefined) {
            this.isRefreshing = params.isRefreshing;
        }
        if (params.isLoadingMore !== undefined) {
            this.isLoadingMore = params.isLoadingMore;
        }
        if (params.showFilter !== undefined) {
            this.showFilter = params.showFilter;
        }
    }
    updateStateVars(params: BookLibraryPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__books.purgeDependencyOnElmtId(rmElmtId);
        this.__tags.purgeDependencyOnElmtId(rmElmtId);
        this.__currentTab.purgeDependencyOnElmtId(rmElmtId);
        this.__searchQuery.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedTagId.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedFormat.purgeDependencyOnElmtId(rmElmtId);
        this.__sortField.purgeDependencyOnElmtId(rmElmtId);
        this.__sortOrder.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPage.purgeDependencyOnElmtId(rmElmtId);
        this.__totalPages.purgeDependencyOnElmtId(rmElmtId);
        this.__totalBooks.purgeDependencyOnElmtId(rmElmtId);
        this.__isRefreshing.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoadingMore.purgeDependencyOnElmtId(rmElmtId);
        this.__showFilter.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__books.aboutToBeDeleted();
        this.__tags.aboutToBeDeleted();
        this.__currentTab.aboutToBeDeleted();
        this.__searchQuery.aboutToBeDeleted();
        this.__selectedTagId.aboutToBeDeleted();
        this.__selectedFormat.aboutToBeDeleted();
        this.__sortField.aboutToBeDeleted();
        this.__sortOrder.aboutToBeDeleted();
        this.__currentPage.aboutToBeDeleted();
        this.__totalPages.aboutToBeDeleted();
        this.__totalBooks.aboutToBeDeleted();
        this.__isRefreshing.aboutToBeDeleted();
        this.__isLoadingMore.aboutToBeDeleted();
        this.__showFilter.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __books: ObservedPropertyObjectPU<Book[]>;
    get books() {
        return this.__books.get();
    }
    set books(newValue: Book[]) {
        this.__books.set(newValue);
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
    private __searchQuery: ObservedPropertySimplePU<string>;
    get searchQuery() {
        return this.__searchQuery.get();
    }
    set searchQuery(newValue: string) {
        this.__searchQuery.set(newValue);
    }
    private __selectedTagId: ObservedPropertySimplePU<number>;
    get selectedTagId() {
        return this.__selectedTagId.get();
    }
    set selectedTagId(newValue: number) {
        this.__selectedTagId.set(newValue);
    }
    private __selectedFormat: ObservedPropertySimplePU<string>;
    get selectedFormat() {
        return this.__selectedFormat.get();
    }
    set selectedFormat(newValue: string) {
        this.__selectedFormat.set(newValue);
    }
    private __sortField: ObservedPropertySimplePU<string>;
    get sortField() {
        return this.__sortField.get();
    }
    set sortField(newValue: string) {
        this.__sortField.set(newValue);
    }
    private __sortOrder: ObservedPropertySimplePU<string>;
    get sortOrder() {
        return this.__sortOrder.get();
    }
    set sortOrder(newValue: string) {
        this.__sortOrder.set(newValue);
    }
    private __currentPage: ObservedPropertySimplePU<number>;
    get currentPage() {
        return this.__currentPage.get();
    }
    set currentPage(newValue: number) {
        this.__currentPage.set(newValue);
    }
    private __totalPages: ObservedPropertySimplePU<number>;
    get totalPages() {
        return this.__totalPages.get();
    }
    set totalPages(newValue: number) {
        this.__totalPages.set(newValue);
    }
    private __totalBooks: ObservedPropertySimplePU<number>;
    get totalBooks() {
        return this.__totalBooks.get();
    }
    set totalBooks(newValue: number) {
        this.__totalBooks.set(newValue);
    }
    private __isRefreshing: ObservedPropertySimplePU<boolean>;
    get isRefreshing() {
        return this.__isRefreshing.get();
    }
    set isRefreshing(newValue: boolean) {
        this.__isRefreshing.set(newValue);
    }
    private __isLoadingMore: ObservedPropertySimplePU<boolean>;
    get isLoadingMore() {
        return this.__isLoadingMore.get();
    }
    set isLoadingMore(newValue: boolean) {
        this.__isLoadingMore.set(newValue);
    }
    private __showFilter: ObservedPropertySimplePU<boolean>;
    get showFilter() {
        return this.__showFilter.get();
    }
    set showFilter(newValue: boolean) {
        this.__showFilter.set(newValue);
    }
    aboutToAppear(): void {
        this.loadBooks(true);
        this.loadTags();
    }
    onTabChange(tab: number): void {
        if (tab === 0) {
            navigateToTab(this.getUIContext(), 'pages/HomePage');
        }
        else if (tab === 1) {
            navigateToTab(this.getUIContext(), 'pages/LibraryPage');
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
    async loadBooks(reset: boolean): Promise<void> {
        if (reset) {
            this.currentPage = 1;
        }
        try {
            let params = new BookQueryParams();
            params.page = this.currentPage;
            params.pageSize = Constants.PAGE_SIZE;
            params.sort = this.sortField;
            params.order = this.sortOrder;
            if (this.searchQuery) {
                params.query = this.searchQuery;
            }
            if (this.selectedTagId > 0) {
                params.tagId = this.selectedTagId;
            }
            if (this.selectedFormat) {
                params.format = this.selectedFormat;
            }
            const res: PaginatedResponse<Book> = await BookService.getBooks(params);
            if (reset) {
                this.books = res.data;
            }
            else {
                this.books = this.books.concat(res.data);
            }
            this.totalPages = res.totalPages;
            this.totalBooks = res.total;
        }
        catch (e) {
            console.error('Failed to load books: ' + JSON.stringify(e));
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
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F1F3F5');
        }, Column);
        this.BookLibraryContent.bind(this)();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new TabBar(this, { currentTab: this.__currentTab, onTabClick: (tab: number) => {
                            this.onTabChange(tab);
                        } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/BookLibraryPage.ets", line: 96, col: 7 });
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
    BookLibraryContent(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.layoutWeight(1);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, top: 8, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Search.create({ value: this.searchQuery, placeholder: '搜索图书' });
            Search.layoutWeight(1);
            Search.height(40);
            Search.backgroundColor('#FFFFFF');
            Search.fontColor('#181818');
            Search.borderRadius(20);
            Search.onChange((value: string) => {
                this.searchQuery = value;
            });
            Search.onSubmit(() => {
                this.loadBooks(true);
            });
        }, Search);
        Search.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.showFilter ? '收起' : '筛选');
            Text.fontSize(13);
            Text.fontColor('#007DFF');
            Text.margin({ left: 12 });
            Text.onClick(() => {
                this.showFilter = !this.showFilter;
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showFilter) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.FilterPanel.bind(this)();
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
            if (this.tags.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.scrollable(ScrollDirection.Horizontal);
                        Scroll.width('100%');
                        Scroll.padding({ left: 16, right: 16, bottom: 8 });
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('全部');
                        Text.fontSize(13);
                        Text.fontColor(this.selectedTagId === 0 ? '#007DFF' : '#999999');
                        Text.backgroundColor(this.selectedTagId === 0 ? '#EBF1FF' : '#F5F5F5');
                        Text.borderRadius(16);
                        Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
                        Text.margin({ right: 8 });
                        Text.onClick(() => {
                            this.selectedTagId = 0;
                            this.loadBooks(true);
                        });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const tag = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(tag.name);
                                Text.fontSize(13);
                                Text.fontColor(this.selectedTagId === tag.id ? '#007DFF' : '#999999');
                                Text.backgroundColor(this.selectedTagId === tag.id ? '#EBF1FF' : '#F5F5F5');
                                Text.borderRadius(16);
                                Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
                                Text.margin({ right: 8 });
                                Text.onClick(() => {
                                    this.selectedTagId = tag.id;
                                    this.loadBooks(true);
                                });
                            }, Text);
                            Text.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.tags, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    Row.pop();
                    Scroll.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.padding({ left: 16, right: 16, bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`共 ${this.totalBooks} 本`);
            Text.fontSize(12);
            Text.fontColor('#999999');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.margin({ left: 'auto' });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('排序:');
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.margin({ right: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.sortField === 'createdAt' ? '添加时间' : this.sortField === 'updatedAt' ? '更新时间' : this.sortField === 'title' ? '标题' : this.sortField === 'lastReadAt' ? '最近阅读' : '评分');
            Text.fontSize(12);
            Text.fontColor('#007DFF');
            Text.onClick(() => {
                const fields: string[] = ['createdAt', 'updatedAt', 'title', 'lastReadAt', 'rating'];
                const idx = fields.indexOf(this.sortField);
                this.sortField = fields[(idx + 1) % fields.length];
                this.loadBooks(true);
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.sortOrder === 'desc' ? '↓' : '↑');
            Text.fontSize(12);
            Text.fontColor('#007DFF');
            Text.margin({ left: 4 });
            Text.onClick(() => {
                this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
                this.loadBooks(true);
            });
        }, Text);
        Text.pop();
        Row.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Refresh.create({ refreshing: { value: this.isRefreshing, changeEvent: newValue => { this.isRefreshing = newValue; } } });
            Refresh.onRefreshing(async () => {
                await this.loadBooks(true);
                this.isRefreshing = false;
            });
        }, Refresh);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Grid.create();
            Grid.columnsTemplate('1fr 1fr 1fr');
            Grid.rowsGap(8);
            Grid.columnsGap(8);
            Grid.width('100%');
            Grid.layoutWeight(1);
            Grid.padding({ left: 12, right: 12 });
        }, Grid);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const book = _item;
                {
                    const itemCreation2 = (elmtId, isInitialRender) => {
                        GridItem.create(() => { }, false);
                        GridItem.padding(4);
                    };
                    const observedDeepRender = () => {
                        this.observeComponentCreation2(itemCreation2, GridItem);
                        this.BookCard.bind(this)(book);
                        GridItem.pop();
                    };
                    observedDeepRender();
                }
            };
            this.forEachUpdateFunction(elmtId, this.books, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Grid.pop();
        Refresh.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.currentPage < this.totalPages) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.height(48);
                        Row.justifyContent(FlexAlign.Center);
                        Row.onClick(async () => {
                            if (!this.isLoadingMore) {
                                this.isLoadingMore = true;
                                this.currentPage++;
                                await this.loadBooks(false);
                                this.isLoadingMore = false;
                            }
                        });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('加载更多');
                        Text.fontSize(14);
                        Text.fontColor('#007DFF');
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
        Column.pop();
    }
    FilterPanel(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding({ left: 16, right: 16, top: 8, bottom: 8 });
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(12);
            Column.margin({ left: 16, right: 16, bottom: 8 });
            Column.shadow({ radius: 6, color: '#10000000', offsetY: 1 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('格式:');
            Text.fontSize(13);
            Text.fontColor('#999999');
            Text.margin({ right: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('全部');
            Text.fontSize(13);
            Text.fontColor(this.selectedFormat === '' ? '#007DFF' : '#999999');
            Text.backgroundColor(this.selectedFormat === '' ? '#EBF1FF' : '#F5F5F5');
            Text.borderRadius(16);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.margin({ right: 6 });
            Text.onClick(() => {
                this.selectedFormat = '';
                this.loadBooks(true);
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('EPUB');
            Text.fontSize(13);
            Text.fontColor(this.selectedFormat === 'epub' ? '#007DFF' : '#999999');
            Text.backgroundColor(this.selectedFormat === 'epub' ? '#EBF1FF' : '#F5F5F5');
            Text.borderRadius(16);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.margin({ right: 6 });
            Text.onClick(() => {
                this.selectedFormat = 'epub';
                this.loadBooks(true);
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('PDF');
            Text.fontSize(13);
            Text.fontColor(this.selectedFormat === 'pdf' ? '#007DFF' : '#999999');
            Text.backgroundColor(this.selectedFormat === 'pdf' ? '#EBF1FF' : '#F5F5F5');
            Text.borderRadius(16);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.margin({ right: 6 });
            Text.onClick(() => {
                this.selectedFormat = 'pdf';
                this.loadBooks(true);
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('TXT');
            Text.fontSize(13);
            Text.fontColor(this.selectedFormat === 'txt' ? '#007DFF' : '#999999');
            Text.backgroundColor(this.selectedFormat === 'txt' ? '#EBF1FF' : '#F5F5F5');
            Text.borderRadius(16);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.margin({ right: 6 });
            Text.onClick(() => {
                this.selectedFormat = 'txt';
                this.loadBooks(true);
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('MOBI');
            Text.fontSize(13);
            Text.fontColor(this.selectedFormat === 'mobi' ? '#007DFF' : '#999999');
            Text.backgroundColor(this.selectedFormat === 'mobi' ? '#EBF1FF' : '#F5F5F5');
            Text.borderRadius(16);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.margin({ right: 6 });
            Text.onClick(() => {
                this.selectedFormat = 'mobi';
                this.loadBooks(true);
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('AZW3');
            Text.fontSize(13);
            Text.fontColor(this.selectedFormat === 'azw3' ? '#007DFF' : '#999999');
            Text.backgroundColor(this.selectedFormat === 'azw3' ? '#EBF1FF' : '#F5F5F5');
            Text.borderRadius(16);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.margin({ right: 6 });
            Text.onClick(() => {
                this.selectedFormat = 'azw3';
                this.loadBooks(true);
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.justifyContent(FlexAlign.End);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('清除筛选');
            Text.fontSize(13);
            Text.fontColor('#FA2A2D');
            Text.onClick(() => {
                this.selectedFormat = '';
                this.selectedTagId = 0;
                this.sortField = 'createdAt';
                this.sortOrder = 'desc';
                this.loadBooks(true);
            });
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    BookCard(book: Book, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(12);
            Column.shadow({
                radius: 8,
                color: '#10000000',
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
            Text.position({ x: '68%', y: 8 });
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
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${formatFileSize(book.fileSize)}`);
            Text.fontSize(12);
            Text.fontColor('#999999');
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "BookLibraryPage";
    }
}
registerNamedRoute(() => new BookLibraryPage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/BookLibraryPage", pageFullPath: "entry/src/main/ets/pages/BookLibraryPage", integratedHsp: "false", moduleType: "followWithHap" });
