if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface LibraryPage_Params {
    comics?: Comic[];
    tags?: Tag[];
    categories?: Category[];
    currentTab?: number;
    searchQuery?: string;
    selectedTagId?: number;
    selectedCategoryId?: number;
    selectedStatus?: string;
    sortField?: string;
    sortOrder?: string;
    currentPage?: number;
    totalPages?: number;
    totalComics?: number;
    isRefreshing?: boolean;
    isLoadingMore?: boolean;
    showFilter?: boolean;
}
import { ComicQueryParams } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
import type { Comic, PaginatedResponse, Tag, Category } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
import { ComicService, TagService, CategoryService } from "@bundle:com.comicreader.harmony/entry/ets/service/ComicService";
import { ComicCard } from "@bundle:com.comicreader.harmony/entry/ets/components/ComicCard";
import { TabBar } from "@bundle:com.comicreader.harmony/entry/ets/components/TabBar";
import { Constants, navigateTo, navigateToTab, NavParams } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
class LibraryPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__comics = new ObservedPropertyObjectPU([], this, "comics");
        this.__tags = new ObservedPropertyObjectPU([], this, "tags");
        this.__categories = new ObservedPropertyObjectPU([], this, "categories");
        this.__currentTab = new ObservedPropertySimplePU(1, this, "currentTab");
        this.__searchQuery = new ObservedPropertySimplePU('', this, "searchQuery");
        this.__selectedTagId = new ObservedPropertySimplePU(0, this, "selectedTagId");
        this.__selectedCategoryId = new ObservedPropertySimplePU(0, this, "selectedCategoryId");
        this.__selectedStatus = new ObservedPropertySimplePU('', this, "selectedStatus");
        this.__sortField = new ObservedPropertySimplePU('createdAt', this, "sortField");
        this.__sortOrder = new ObservedPropertySimplePU('desc', this, "sortOrder");
        this.__currentPage = new ObservedPropertySimplePU(1, this, "currentPage");
        this.__totalPages = new ObservedPropertySimplePU(1, this, "totalPages");
        this.__totalComics = new ObservedPropertySimplePU(0, this, "totalComics");
        this.__isRefreshing = new ObservedPropertySimplePU(false, this, "isRefreshing");
        this.__isLoadingMore = new ObservedPropertySimplePU(false, this, "isLoadingMore");
        this.__showFilter = new ObservedPropertySimplePU(false, this, "showFilter");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: LibraryPage_Params) {
        if (params.comics !== undefined) {
            this.comics = params.comics;
        }
        if (params.tags !== undefined) {
            this.tags = params.tags;
        }
        if (params.categories !== undefined) {
            this.categories = params.categories;
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
        if (params.selectedCategoryId !== undefined) {
            this.selectedCategoryId = params.selectedCategoryId;
        }
        if (params.selectedStatus !== undefined) {
            this.selectedStatus = params.selectedStatus;
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
        if (params.totalComics !== undefined) {
            this.totalComics = params.totalComics;
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
    updateStateVars(params: LibraryPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__comics.purgeDependencyOnElmtId(rmElmtId);
        this.__tags.purgeDependencyOnElmtId(rmElmtId);
        this.__categories.purgeDependencyOnElmtId(rmElmtId);
        this.__currentTab.purgeDependencyOnElmtId(rmElmtId);
        this.__searchQuery.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedTagId.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedCategoryId.purgeDependencyOnElmtId(rmElmtId);
        this.__selectedStatus.purgeDependencyOnElmtId(rmElmtId);
        this.__sortField.purgeDependencyOnElmtId(rmElmtId);
        this.__sortOrder.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPage.purgeDependencyOnElmtId(rmElmtId);
        this.__totalPages.purgeDependencyOnElmtId(rmElmtId);
        this.__totalComics.purgeDependencyOnElmtId(rmElmtId);
        this.__isRefreshing.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoadingMore.purgeDependencyOnElmtId(rmElmtId);
        this.__showFilter.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__comics.aboutToBeDeleted();
        this.__tags.aboutToBeDeleted();
        this.__categories.aboutToBeDeleted();
        this.__currentTab.aboutToBeDeleted();
        this.__searchQuery.aboutToBeDeleted();
        this.__selectedTagId.aboutToBeDeleted();
        this.__selectedCategoryId.aboutToBeDeleted();
        this.__selectedStatus.aboutToBeDeleted();
        this.__sortField.aboutToBeDeleted();
        this.__sortOrder.aboutToBeDeleted();
        this.__currentPage.aboutToBeDeleted();
        this.__totalPages.aboutToBeDeleted();
        this.__totalComics.aboutToBeDeleted();
        this.__isRefreshing.aboutToBeDeleted();
        this.__isLoadingMore.aboutToBeDeleted();
        this.__showFilter.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __comics: ObservedPropertyObjectPU<Comic[]>;
    get comics() {
        return this.__comics.get();
    }
    set comics(newValue: Comic[]) {
        this.__comics.set(newValue);
    }
    private __tags: ObservedPropertyObjectPU<Tag[]>;
    get tags() {
        return this.__tags.get();
    }
    set tags(newValue: Tag[]) {
        this.__tags.set(newValue);
    }
    private __categories: ObservedPropertyObjectPU<Category[]>;
    get categories() {
        return this.__categories.get();
    }
    set categories(newValue: Category[]) {
        this.__categories.set(newValue);
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
    private __selectedCategoryId: ObservedPropertySimplePU<number>;
    get selectedCategoryId() {
        return this.__selectedCategoryId.get();
    }
    set selectedCategoryId(newValue: number) {
        this.__selectedCategoryId.set(newValue);
    }
    private __selectedStatus: ObservedPropertySimplePU<string>;
    get selectedStatus() {
        return this.__selectedStatus.get();
    }
    set selectedStatus(newValue: string) {
        this.__selectedStatus.set(newValue);
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
    private __totalComics: ObservedPropertySimplePU<number>;
    get totalComics() {
        return this.__totalComics.get();
    }
    set totalComics(newValue: number) {
        this.__totalComics.set(newValue);
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
        this.loadComics(true);
        this.loadTags();
        this.loadCategories();
    }
    onTabChange(tab: number): void {
        if (tab === 0) {
            navigateToTab(this.getUIContext(), 'pages/HomePage');
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
    async loadComics(reset: boolean): Promise<void> {
        if (reset) {
            this.currentPage = 1;
        }
        try {
            let params = new ComicQueryParams();
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
            if (this.selectedCategoryId > 0) {
                params.categoryId = this.selectedCategoryId;
            }
            if (this.selectedStatus) {
                params.status = this.selectedStatus;
            }
            const res: PaginatedResponse<Comic> = await ComicService.getComics(params);
            if (reset) {
                this.comics = res.data;
            }
            else {
                this.comics = this.comics.concat(res.data);
            }
            this.totalPages = res.totalPages;
            this.totalComics = res.total;
        }
        catch (e) {
            console.error('Failed to load comics: ' + JSON.stringify(e));
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
    async loadCategories(): Promise<void> {
        try {
            this.categories = await CategoryService.getCategories();
        }
        catch (e) {
            console.error('Failed to load categories: ' + JSON.stringify(e));
        }
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#F1F3F5');
        }, Column);
        this.LibraryContent.bind(this)();
        {
            this.observeComponentCreation2((elmtId, isInitialRender) => {
                if (isInitialRender) {
                    let componentCall = new TabBar(this, { currentTab: this.__currentTab, onTabClick: (tab: number) => {
                            this.onTabChange(tab);
                        } }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/LibraryPage.ets", line: 104, col: 7 });
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
    LibraryContent(parent = null) {
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
            Search.create({ value: this.searchQuery, placeholder: '搜索漫画' });
            Search.layoutWeight(1);
            Search.height(40);
            Search.backgroundColor('#FFFFFF');
            Search.fontColor('#181818');
            Search.borderRadius(20);
            Search.onChange((value: string) => {
                this.searchQuery = value;
            });
            Search.onSubmit(() => {
                this.loadComics(true);
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
                            this.loadComics(true);
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
                                    this.loadComics(true);
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
            Text.create(`共 ${this.totalComics} 部`);
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
                this.loadComics(true);
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
                this.loadComics(true);
            });
        }, Text);
        Text.pop();
        Row.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Refresh.create({ refreshing: { value: this.isRefreshing, changeEvent: newValue => { this.isRefreshing = newValue; } } });
            Refresh.onRefreshing(async () => {
                await this.loadComics(true);
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
                                    }, undefined, elmtId, () => { }, { page: "entry/src/main/ets/pages/LibraryPage.ets", line: 219, col: 15 });
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
            this.forEachUpdateFunction(elmtId, this.comics, forEachItemGenFunction);
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
                                await this.loadComics(false);
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
            Text.create('状态:');
            Text.fontSize(13);
            Text.fontColor('#999999');
            Text.margin({ right: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('全部');
            Text.fontSize(13);
            Text.fontColor(this.selectedStatus === '' ? '#007DFF' : '#999999');
            Text.backgroundColor(this.selectedStatus === '' ? '#EBF1FF' : '#F5F5F5');
            Text.borderRadius(16);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.margin({ right: 6 });
            Text.onClick(() => {
                this.selectedStatus = '';
                this.loadComics(true);
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('连载中');
            Text.fontSize(13);
            Text.fontColor(this.selectedStatus === 'ongoing' ? '#007DFF' : '#999999');
            Text.backgroundColor(this.selectedStatus === 'ongoing' ? '#EBF1FF' : '#F5F5F5');
            Text.borderRadius(16);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.margin({ right: 6 });
            Text.onClick(() => {
                this.selectedStatus = 'ongoing';
                this.loadComics(true);
            });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('已完结');
            Text.fontSize(13);
            Text.fontColor(this.selectedStatus === 'completed' ? '#007DFF' : '#999999');
            Text.backgroundColor(this.selectedStatus === 'completed' ? '#EBF1FF' : '#F5F5F5');
            Text.borderRadius(16);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.margin({ right: 6 });
            Text.onClick(() => {
                this.selectedStatus = 'completed';
                this.loadComics(true);
            });
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.categories.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.alignItems(VerticalAlign.Center);
                        Row.margin({ bottom: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('分类:');
                        Text.fontSize(13);
                        Text.fontColor('#9CA3AF');
                        Text.margin({ right: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.scrollable(ScrollDirection.Horizontal);
                        Scroll.layoutWeight(1);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('全部');
                        Text.fontSize(13);
                        Text.fontColor(this.selectedCategoryId === 0 ? '#6366F1' : '#9CA3AF');
                        Text.backgroundColor(this.selectedCategoryId === 0 ? '#312E81' : '#1F2937');
                        Text.borderRadius(16);
                        Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
                        Text.margin({ right: 6 });
                        Text.onClick(() => {
                            this.selectedCategoryId = 0;
                            this.loadComics(true);
                        });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const cat = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(cat.name);
                                Text.fontSize(13);
                                Text.fontColor(this.selectedCategoryId === cat.id ? '#6366F1' : '#9CA3AF');
                                Text.backgroundColor(this.selectedCategoryId === cat.id ? '#312E81' : '#1F2937');
                                Text.borderRadius(16);
                                Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
                                Text.margin({ right: 6 });
                                Text.onClick(() => {
                                    this.selectedCategoryId = cat.id;
                                    this.loadComics(true);
                                });
                            }, Text);
                            Text.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.categories, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    Row.pop();
                    Scroll.pop();
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
            Row.create();
            Row.width('100%');
            Row.justifyContent(FlexAlign.End);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('清除筛选');
            Text.fontSize(13);
            Text.fontColor('#FA2A2D');
            Text.onClick(() => {
                this.selectedStatus = '';
                this.selectedCategoryId = 0;
                this.selectedTagId = 0;
                this.sortField = 'createdAt';
                this.sortOrder = 'desc';
                this.loadComics(true);
            });
        }, Text);
        Text.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "LibraryPage";
    }
}
registerNamedRoute(() => new LibraryPage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/LibraryPage", pageFullPath: "entry/src/main/ets/pages/LibraryPage", integratedHsp: "false", moduleType: "followWithHap" });
