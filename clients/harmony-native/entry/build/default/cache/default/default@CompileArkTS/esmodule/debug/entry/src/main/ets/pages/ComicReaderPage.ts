if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ComicReaderPage_Params {
    comicId?: number;
    chapterId?: number;
    chapters?: Chapter[];
    currentPage?: number;
    totalPages?: number;
    showControls?: boolean;
    readingMode?: number;
    scaleValue?: number;
    isLoading?: boolean;
    comicTitle?: string;
    hideTimer?: number;
    swiperController?: SwiperController;
}
import { ComicService } from "@bundle:com.comicreader.harmony/entry/ets/service/ComicService";
import type { Chapter, ChapterPagesResult } from '../model/ComicModels';
class ComicReaderPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__comicId = new ObservedPropertySimplePU(0, this, "comicId");
        this.__chapterId = new ObservedPropertySimplePU(0, this, "chapterId");
        this.__chapters = new ObservedPropertyObjectPU([], this, "chapters");
        this.__currentPage = new ObservedPropertySimplePU(1, this, "currentPage");
        this.__totalPages = new ObservedPropertySimplePU(0, this, "totalPages");
        this.__showControls = new ObservedPropertySimplePU(true, this, "showControls");
        this.__readingMode = new ObservedPropertySimplePU(0, this, "readingMode");
        this.__scaleValue = new ObservedPropertySimplePU(100, this, "scaleValue");
        this.__isLoading = new ObservedPropertySimplePU(true, this, "isLoading");
        this.__comicTitle = new ObservedPropertySimplePU('', this, "comicTitle");
        this.hideTimer = -1;
        this.swiperController = new SwiperController();
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ComicReaderPage_Params) {
        if (params.comicId !== undefined) {
            this.comicId = params.comicId;
        }
        if (params.chapterId !== undefined) {
            this.chapterId = params.chapterId;
        }
        if (params.chapters !== undefined) {
            this.chapters = params.chapters;
        }
        if (params.currentPage !== undefined) {
            this.currentPage = params.currentPage;
        }
        if (params.totalPages !== undefined) {
            this.totalPages = params.totalPages;
        }
        if (params.showControls !== undefined) {
            this.showControls = params.showControls;
        }
        if (params.readingMode !== undefined) {
            this.readingMode = params.readingMode;
        }
        if (params.scaleValue !== undefined) {
            this.scaleValue = params.scaleValue;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.comicTitle !== undefined) {
            this.comicTitle = params.comicTitle;
        }
        if (params.hideTimer !== undefined) {
            this.hideTimer = params.hideTimer;
        }
        if (params.swiperController !== undefined) {
            this.swiperController = params.swiperController;
        }
    }
    updateStateVars(params: ComicReaderPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__comicId.purgeDependencyOnElmtId(rmElmtId);
        this.__chapterId.purgeDependencyOnElmtId(rmElmtId);
        this.__chapters.purgeDependencyOnElmtId(rmElmtId);
        this.__currentPage.purgeDependencyOnElmtId(rmElmtId);
        this.__totalPages.purgeDependencyOnElmtId(rmElmtId);
        this.__showControls.purgeDependencyOnElmtId(rmElmtId);
        this.__readingMode.purgeDependencyOnElmtId(rmElmtId);
        this.__scaleValue.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__comicTitle.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__comicId.aboutToBeDeleted();
        this.__chapterId.aboutToBeDeleted();
        this.__chapters.aboutToBeDeleted();
        this.__currentPage.aboutToBeDeleted();
        this.__totalPages.aboutToBeDeleted();
        this.__showControls.aboutToBeDeleted();
        this.__readingMode.aboutToBeDeleted();
        this.__scaleValue.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__comicTitle.aboutToBeDeleted();
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
    private __chapterId: ObservedPropertySimplePU<number>;
    get chapterId() {
        return this.__chapterId.get();
    }
    set chapterId(newValue: number) {
        this.__chapterId.set(newValue);
    }
    private __chapters: ObservedPropertyObjectPU<Chapter[]>;
    get chapters() {
        return this.__chapters.get();
    }
    set chapters(newValue: Chapter[]) {
        this.__chapters.set(newValue);
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
    private __showControls: ObservedPropertySimplePU<boolean>;
    get showControls() {
        return this.__showControls.get();
    }
    set showControls(newValue: boolean) {
        this.__showControls.set(newValue);
    }
    private __readingMode: ObservedPropertySimplePU<number>;
    get readingMode() {
        return this.__readingMode.get();
    }
    set readingMode(newValue: number) {
        this.__readingMode.set(newValue);
    }
    private __scaleValue: ObservedPropertySimplePU<number>;
    get scaleValue() {
        return this.__scaleValue.get();
    }
    set scaleValue(newValue: number) {
        this.__scaleValue.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __comicTitle: ObservedPropertySimplePU<string>;
    get comicTitle() {
        return this.__comicTitle.get();
    }
    set comicTitle(newValue: string) {
        this.__comicTitle.set(newValue);
    }
    private hideTimer: number;
    private swiperController: SwiperController;
    aboutToAppear(): void {
        const params = this.getUIContext().getRouter().getParams() as Record<string, number>;
        if (params) {
            this.comicId = params.comicId ?? 0;
            this.chapterId = params.chapterId ?? 0;
        }
        this.loadData();
    }
    aboutToDisappear(): void {
        if (this.hideTimer !== -1) {
            clearTimeout(this.hideTimer);
        }
    }
    async loadData(): Promise<void> {
        try {
            this.isLoading = true;
            if (this.chapterId === 0) {
                this.chapters = await ComicService.getChapters(this.comicId);
                if (this.chapters.length > 0) {
                    this.chapterId = this.chapters[0].id;
                }
            }
            else {
                this.chapters = await ComicService.getChapters(this.comicId);
            }
            if (this.chapterId > 0) {
                const result: ChapterPagesResult = await ComicService.getChapterPages(this.chapterId);
                this.totalPages = result.pages;
            }
            this.isLoading = false;
        }
        catch (e) {
            console.error('Failed to load chapter data: ' + JSON.stringify(e));
            this.isLoading = false;
        }
    }
    resetHideTimer(): void {
        if (this.hideTimer !== -1) {
            clearTimeout(this.hideTimer);
        }
        this.hideTimer = setTimeout(() => {
            this.showControls = false;
        }, 3000);
    }
    toggleControls(): void {
        this.showControls = !this.showControls;
        if (this.showControls) {
            this.resetHideTimer();
        }
    }
    async saveProgress(): Promise<void> {
        try {
            await ComicService.updateProgress(this.comicId, this.chapterId, this.currentPage, this.totalPages);
        }
        catch (e) {
            console.error('Failed to save progress: ' + JSON.stringify(e));
        }
    }
    goToPage(page: number): void {
        if (page < 1)
            page = 1;
        if (page > this.totalPages)
            page = this.totalPages;
        this.currentPage = page;
        this.saveProgress();
    }
    nextPage(): void {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.saveProgress();
        }
    }
    prevPage(): void {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.saveProgress();
        }
    }
    async switchChapter(chapterId: number): Promise<void> {
        this.chapterId = chapterId;
        this.currentPage = 1;
        try {
            const result: ChapterPagesResult = await ComicService.getChapterPages(this.chapterId);
            this.totalPages = result.pages;
        }
        catch (e) {
            console.error('Failed to load chapter: ' + JSON.stringify(e));
        }
    }
    prevChapter(): void {
        const idx = this.chapters.findIndex((c: Chapter) => c.id === this.chapterId);
        if (idx > 0) {
            this.switchChapter(this.chapters[idx - 1].id);
        }
    }
    nextChapter(): void {
        const idx = this.chapters.findIndex((c: Chapter) => c.id === this.chapterId);
        if (idx < this.chapters.length - 1) {
            this.switchChapter(this.chapters[idx + 1].id);
        }
    }
    SinglePageMode(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create(ComicService.getPageImageUrl(this.chapterId, this.currentPage));
            Image.width(`${this.scaleValue}%`);
            Image.objectFit(ImageFit.Contain);
            Image.onClick(() => this.toggleControls());
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('30%');
            Column.height('100%');
            Column.onClick(() => this.prevPage());
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('40%');
            Column.height('100%');
            Column.onClick(() => this.toggleControls());
        }, Column);
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('30%');
            Column.height('100%');
            Column.onClick(() => this.nextPage());
        }, Column);
        Column.pop();
        Row.pop();
        Stack.pop();
    }
    DoublePageMode(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.height('100%');
            Row.onClick(() => this.toggleControls());
            globalThis.Gesture.create(GesturePriority.Low);
            PanGesture.create();
            PanGesture.onActionEnd((e: GestureEvent) => {
                if (e.offsetX < -50)
                    this.nextPage();
                else if (e.offsetX > 50)
                    this.prevPage();
            });
            PanGesture.pop();
            globalThis.Gesture.pop();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.currentPage > 1) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create(ComicService.getPageImageUrl(this.chapterId, this.currentPage - 1));
                        Image.width('50%');
                        Image.height('100%');
                        Image.objectFit(ImageFit.Contain);
                    }, Image);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create(ComicService.getPageImageUrl(this.chapterId, this.currentPage));
            Image.width('50%');
            Image.height('100%');
            Image.objectFit(ImageFit.Contain);
        }, Image);
        Row.pop();
    }
    ScrollMode(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Scroll.create();
            Scroll.width('100%');
            Scroll.height('100%');
            Scroll.scrollable(ScrollDirection.Vertical);
        }, Scroll);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const pageNum = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Image.create(ComicService.getPageImageUrl(this.chapterId, pageNum));
                    Image.width('100%');
                    Image.objectFit(ImageFit.Auto);
                }, Image);
            };
            this.forEachUpdateFunction(elmtId, Array.from({ length: this.totalPages }, (_v: Object, i: number) => i + 1), forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Column.pop();
        Scroll.pop();
    }
    SlideMode(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Swiper.create(this.swiperController);
            Swiper.index(this.currentPage - 1);
            Swiper.indicator(false);
            Swiper.loop(false);
            Swiper.onChange((index: number) => {
                this.currentPage = index + 1;
                this.saveProgress();
            });
        }, Swiper);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const pageNum = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Image.create(ComicService.getPageImageUrl(this.chapterId, pageNum));
                    Image.width('100%');
                    Image.height('100%');
                    Image.objectFit(ImageFit.Contain);
                }, Image);
            };
            this.forEachUpdateFunction(elmtId, Array.from({ length: this.totalPages }, (_v: Object, i: number) => i + 1), forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Swiper.pop();
    }
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.width('100%');
            Stack.height('100%');
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height('100%');
            Column.backgroundColor('#000000');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.isLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.width(48);
                        LoadingProgress.height(48);
                        LoadingProgress.color('#6366F1');
                    }, LoadingProgress);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('加载中...');
                        Text.fontSize(14);
                        Text.fontColor('#9CA3AF');
                        Text.margin({ top: 12 });
                    }, Text);
                    Text.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        If.create();
                        if (this.readingMode === 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.SinglePageMode.bind(this)();
                            });
                        }
                        else if (this.readingMode === 1) {
                            this.ifElseBranchUpdateFunction(1, () => {
                                this.DoublePageMode.bind(this)();
                            });
                        }
                        else if (this.readingMode === 2) {
                            this.ifElseBranchUpdateFunction(2, () => {
                                this.SlideMode.bind(this)();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(3, () => {
                                this.ScrollMode.bind(this)();
                            });
                        }
                    }, If);
                    If.pop();
                });
            }
        }, If);
        If.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showControls) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.height('100%');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.height(56);
                        Row.padding({ left: 16, right: 16 });
                        Row.alignItems(VerticalAlign.Center);
                        Row.backgroundColor('#CC000000');
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create({ "id": 125830087, "type": 20000, params: [], "bundleName": "com.comicreader.harmony", "moduleName": "entry" });
                        Image.width(24);
                        Image.height(24);
                        Image.fillColor('#FFFFFF');
                        Image.onClick(() => { try {
                            this.getUIContext().getRouter().back();
                        }
                        catch (e) {
                            console.error('Back failed: ' + JSON.stringify(e));
                        } });
                    }, Image);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.comicTitle);
                        Text.fontSize(16);
                        Text.fontColor('#FFFFFF');
                        Text.layoutWeight(1);
                        Text.maxLines(1);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.margin({ left: 12 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.currentPage}/${this.totalPages}`);
                        Text.fontSize(14);
                        Text.fontColor('#9CA3AF');
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                    }, Column);
                    Column.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding({ top: 12, bottom: 24 });
                        Column.backgroundColor('#CC000000');
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.justifyContent(FlexAlign.Center);
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('单页');
                        Text.fontSize(12);
                        Text.fontColor(this.readingMode === 0 ? '#6366F1' : '#9CA3AF');
                        Text.backgroundColor(this.readingMode === 0 ? '#312E81' : '#1F2937');
                        Text.borderRadius(12);
                        Text.padding({ left: 10, right: 10, top: 6, bottom: 6 });
                        Text.onClick(() => { this.readingMode = 0; });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('双页');
                        Text.fontSize(12);
                        Text.fontColor(this.readingMode === 1 ? '#6366F1' : '#9CA3AF');
                        Text.backgroundColor(this.readingMode === 1 ? '#312E81' : '#1F2937');
                        Text.borderRadius(12);
                        Text.padding({ left: 10, right: 10, top: 6, bottom: 6 });
                        Text.margin({ left: 8 });
                        Text.onClick(() => { this.readingMode = 1; });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('滑动');
                        Text.fontSize(12);
                        Text.fontColor(this.readingMode === 2 ? '#6366F1' : '#9CA3AF');
                        Text.backgroundColor(this.readingMode === 2 ? '#312E81' : '#1F2937');
                        Text.borderRadius(12);
                        Text.padding({ left: 10, right: 10, top: 6, bottom: 6 });
                        Text.margin({ left: 8 });
                        Text.onClick(() => { this.readingMode = 2; });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('滚动');
                        Text.fontSize(12);
                        Text.fontColor(this.readingMode === 3 ? '#6366F1' : '#9CA3AF');
                        Text.backgroundColor(this.readingMode === 3 ? '#312E81' : '#1F2937');
                        Text.borderRadius(12);
                        Text.padding({ left: 10, right: 10, top: 6, bottom: 6 });
                        Text.margin({ left: 8 });
                        Text.onClick(() => { this.readingMode = 3; });
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.justifyContent(FlexAlign.Center);
                        Row.alignItems(VerticalAlign.Center);
                        Row.margin({ bottom: 12 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('-');
                        Text.fontSize(18);
                        Text.fontColor('#FFFFFF');
                        Text.width(36);
                        Text.height(36);
                        Text.textAlign(TextAlign.Center);
                        Text.borderRadius(18);
                        Text.backgroundColor('#1F2937');
                        Text.onClick(() => {
                            if (this.scaleValue > 50)
                                this.scaleValue -= 10;
                        });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Slider.create({
                            value: this.scaleValue,
                            min: 50,
                            max: 300,
                            step: 10,
                            style: SliderStyle.InSet
                        });
                        Slider.width('50%');
                        Slider.trackColor('#1F2937');
                        Slider.selectedColor('#6366F1');
                        Slider.onChange((value: number) => {
                            this.scaleValue = value;
                        });
                    }, Slider);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('+');
                        Text.fontSize(18);
                        Text.fontColor('#FFFFFF');
                        Text.width(36);
                        Text.height(36);
                        Text.textAlign(TextAlign.Center);
                        Text.borderRadius(18);
                        Text.backgroundColor('#1F2937');
                        Text.onClick(() => {
                            if (this.scaleValue < 300)
                                this.scaleValue += 10;
                        });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.scaleValue}%`);
                        Text.fontSize(12);
                        Text.fontColor('#9CA3AF');
                        Text.width(40);
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                    Row.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding({ left: 16, right: 16 });
                        Row.alignItems(VerticalAlign.Center);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('上一话');
                        Button.fontSize(12);
                        Button.fontColor('#FFFFFF');
                        Button.backgroundColor('#1F2937');
                        Button.borderRadius(16);
                        Button.height(32);
                        Button.enabled(this.chapters.findIndex((c: Chapter) => c.id === this.chapterId) > 0);
                        Button.onClick(() => this.prevChapter());
                    }, Button);
                    Button.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Slider.create({
                            value: this.currentPage,
                            min: 1,
                            max: Math.max(this.totalPages, 1),
                            step: 1,
                            style: SliderStyle.InSet
                        });
                        Slider.layoutWeight(1);
                        Slider.trackColor('#1F2937');
                        Slider.selectedColor('#6366F1');
                        Slider.onChange((value: number) => {
                            this.goToPage(Math.round(value));
                        });
                    }, Slider);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('下一话');
                        Button.fontSize(12);
                        Button.fontColor('#FFFFFF');
                        Button.backgroundColor('#1F2937');
                        Button.borderRadius(16);
                        Button.height(32);
                        Button.enabled(this.chapters.findIndex((c: Chapter) => c.id === this.chapterId) < this.chapters.length - 1);
                        Button.onClick(() => this.nextChapter());
                    }, Button);
                    Button.pop();
                    Row.pop();
                    Column.pop();
                    Column.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        Stack.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "ComicReaderPage";
    }
}
registerNamedRoute(() => new ComicReaderPage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/ComicReaderPage", pageFullPath: "entry/src/main/ets/pages/ComicReaderPage", integratedHsp: "false", moduleType: "followWithHap" });
