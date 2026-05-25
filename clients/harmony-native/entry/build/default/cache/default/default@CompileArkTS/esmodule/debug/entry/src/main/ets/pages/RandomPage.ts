if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface RandomPage_Params {
    randomType?: number;
    resultComic?: Comic | null;
    resultBook?: Book | null;
    resultType?: string;
    isLoading?: boolean;
    typeOptions?: SelectItem[];
}
import { SelectItem } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
import type { Comic, Book } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
import { ComicService, BookService } from "@bundle:com.comicreader.harmony/entry/ets/service/ComicService";
import { navigateTo, NavParams, navigateToTab } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
class RandomPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__randomType = new ObservedPropertySimplePU(0, this, "randomType");
        this.__resultComic = new ObservedPropertyObjectPU(null, this, "resultComic");
        this.__resultBook = new ObservedPropertyObjectPU(null, this, "resultBook");
        this.__resultType = new ObservedPropertySimplePU('', this, "resultType");
        this.__isLoading = new ObservedPropertySimplePU(false, this, "isLoading");
        this.__typeOptions = new ObservedPropertyObjectPU([], this, "typeOptions");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: RandomPage_Params) {
        if (params.randomType !== undefined) {
            this.randomType = params.randomType;
        }
        if (params.resultComic !== undefined) {
            this.resultComic = params.resultComic;
        }
        if (params.resultBook !== undefined) {
            this.resultBook = params.resultBook;
        }
        if (params.resultType !== undefined) {
            this.resultType = params.resultType;
        }
        if (params.isLoading !== undefined) {
            this.isLoading = params.isLoading;
        }
        if (params.typeOptions !== undefined) {
            this.typeOptions = params.typeOptions;
        }
    }
    updateStateVars(params: RandomPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__randomType.purgeDependencyOnElmtId(rmElmtId);
        this.__resultComic.purgeDependencyOnElmtId(rmElmtId);
        this.__resultBook.purgeDependencyOnElmtId(rmElmtId);
        this.__resultType.purgeDependencyOnElmtId(rmElmtId);
        this.__isLoading.purgeDependencyOnElmtId(rmElmtId);
        this.__typeOptions.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__randomType.aboutToBeDeleted();
        this.__resultComic.aboutToBeDeleted();
        this.__resultBook.aboutToBeDeleted();
        this.__resultType.aboutToBeDeleted();
        this.__isLoading.aboutToBeDeleted();
        this.__typeOptions.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __randomType: ObservedPropertySimplePU<number>;
    get randomType() {
        return this.__randomType.get();
    }
    set randomType(newValue: number) {
        this.__randomType.set(newValue);
    }
    private __resultComic: ObservedPropertyObjectPU<Comic | null>;
    get resultComic() {
        return this.__resultComic.get();
    }
    set resultComic(newValue: Comic | null) {
        this.__resultComic.set(newValue);
    }
    private __resultBook: ObservedPropertyObjectPU<Book | null>;
    get resultBook() {
        return this.__resultBook.get();
    }
    set resultBook(newValue: Book | null) {
        this.__resultBook.set(newValue);
    }
    private __resultType: ObservedPropertySimplePU<string>;
    get resultType() {
        return this.__resultType.get();
    }
    set resultType(newValue: string) {
        this.__resultType.set(newValue);
    }
    private __isLoading: ObservedPropertySimplePU<boolean>;
    get isLoading() {
        return this.__isLoading.get();
    }
    set isLoading(newValue: boolean) {
        this.__isLoading.set(newValue);
    }
    private __typeOptions: ObservedPropertyObjectPU<SelectItem[]>;
    get typeOptions() {
        return this.__typeOptions.get();
    }
    set typeOptions(newValue: SelectItem[]) {
        this.__typeOptions.set(newValue);
    }
    aboutToAppear(): void {
        const opts: SelectItem[] = [];
        let opt1 = new SelectItem();
        opt1.key = 0;
        opt1.label = '全部';
        opts.push(opt1);
        let opt2 = new SelectItem();
        opt2.key = 1;
        opt2.label = '仅漫画';
        opts.push(opt2);
        let opt3 = new SelectItem();
        opt3.key = 2;
        opt3.label = '仅图书';
        opts.push(opt3);
        this.typeOptions = opts;
    }
    async fetchRandom(): Promise<void> {
        this.isLoading = true;
        this.resultComic = null;
        this.resultBook = null;
        this.resultType = '';
        try {
            if (this.randomType === 0) {
                const useComic = Math.random() < 0.5;
                if (useComic) {
                    const comics: Comic[] = await ComicService.getRandomComics(1);
                    if (comics.length > 0) {
                        this.resultComic = comics[0];
                        this.resultType = 'comic';
                    }
                }
                else {
                    const books: Book[] = await BookService.getRandomBooks(1);
                    if (books.length > 0) {
                        this.resultBook = books[0];
                        this.resultType = 'book';
                    }
                }
            }
            else if (this.randomType === 1) {
                const comics: Comic[] = await ComicService.getRandomComics(1);
                if (comics.length > 0) {
                    this.resultComic = comics[0];
                    this.resultType = 'comic';
                }
            }
            else {
                const books: Book[] = await BookService.getRandomBooks(1);
                if (books.length > 0) {
                    this.resultBook = books[0];
                    this.resultType = 'book';
                }
            }
        }
        catch (e) {
            console.error('Failed to fetch random: ' + JSON.stringify(e));
        }
        finally {
            this.isLoading = false;
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
            Text.create('随机发现');
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
            Column.create();
            Column.layoutWeight(1);
            Column.width('100%');
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor('#FFFFFF');
            Column.shadow({ radius: 6, color: '#10000000', offsetY: 1 });
            Column.borderRadius(12);
            Column.padding(16);
            Column.margin({ top: 16, left: 16, right: 16 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('随机类型');
            Text.fontSize(14);
            Text.fontColor('#999999');
            Text.width('100%');
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const item = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(item.label);
                    Text.fontSize(14);
                    Text.fontColor(this.randomType === item.key ? '#FFFFFF' : '#999999');
                    Text.backgroundColor(this.randomType === item.key ? '#007DFF' : '#F5F5F5');
                    Text.borderRadius(16);
                    Text.padding({ left: 16, right: 16, top: 8, bottom: 8 });
                    Text.margin({ right: 8 });
                    Text.onClick(() => {
                        this.randomType = item.key;
                    });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, this.typeOptions, forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Column.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isLoading ? '抽取中...' : '🎲 随机推荐');
            Button.width('100%');
            Button.height(52);
            Button.fontSize(18);
            Button.fontWeight(FontWeight.Bold);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#007DFF');
            Button.borderRadius(26);
            Button.margin({ top: 20, left: 16, right: 16 });
            Button.enabled(!this.isLoading);
            Button.onClick(() => {
                this.fetchRandom();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.resultType === 'comic' && this.resultComic) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.ComicResultCard.bind(this)();
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
            if (this.resultType === 'book' && this.resultBook) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.BookResultCard.bind(this)();
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
            if (!this.resultType && !this.isLoading) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.layoutWeight(1);
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('点击上方按钮，随机发现一本好书或漫画');
                        Text.fontSize(14);
                        Text.fontColor('#CCCCCC');
                        Text.textAlign(TextAlign.Center);
                    }, Text);
                    Text.pop();
                    Column.pop();
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
    }
    ComicResultCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor('#FFFFFF');
            Column.shadow({ radius: 6, color: '#10000000', offsetY: 1 });
            Column.borderRadius(12);
            Column.padding(16);
            Column.margin({ top: 20, left: 16, right: 16 });
            Column.onClick(() => {
                let p = new NavParams();
                p.comicId = this.resultComic!.id;
                navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p);
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.resultComic!.coverPath) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create(ComicService.getCoverUrl(this.resultComic!.id));
                        Image.width(100);
                        Image.height(140);
                        Image.objectFit(ImageFit.Cover);
                        Image.borderRadius(8);
                    }, Image);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width(100);
                        Column.height(140);
                        Column.linearGradient({
                            direction: GradientDirection.RightBottom,
                            colors: [['#007DFF', 0.0], ['#0052CC', 1.0]]
                        });
                        Column.borderRadius(8);
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.resultComic!.title);
                        Text.fontSize(12);
                        Text.fontColor('#FFFFFF');
                        Text.maxLines(3);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.textAlign(TextAlign.Center);
                        Text.padding({ left: 4, right: 4 });
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
            Column.margin({ left: 12 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.resultComic!.title);
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#181818');
            Text.maxLines(2);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.resultComic!.author) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`作者: ${this.resultComic!.author}`);
                        Text.fontSize(13);
                        Text.fontColor('#999999');
                        Text.margin({ top: 6 });
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(`${this.resultComic!.pageCount} 页`);
            Text.fontSize(13);
            Text.fontColor('#999999');
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('漫画');
            Text.fontSize(12);
            Text.fontColor('#007DFF');
            Text.backgroundColor('#EBF1FF');
            Text.borderRadius(8);
            Text.padding({ left: 8, right: 8, top: 2, bottom: 2 });
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        Column.pop();
    }
    BookResultCard(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor('#FFFFFF');
            Column.shadow({ radius: 6, color: '#10000000', offsetY: 1 });
            Column.borderRadius(12);
            Column.padding(16);
            Column.margin({ top: 20, left: 16, right: 16 });
            Column.onClick(() => {
                let p = new NavParams();
                p.bookId = this.resultBook!.id;
                navigateTo(this.getUIContext(), 'pages/BookDetailPage', p);
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.alignItems(VerticalAlign.Top);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.resultBook!.coverPath) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create(BookService.getCoverUrl(this.resultBook!.id));
                        Image.width(100);
                        Image.height(140);
                        Image.objectFit(ImageFit.Cover);
                        Image.borderRadius(8);
                    }, Image);
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width(100);
                        Column.height(140);
                        Column.linearGradient({
                            direction: GradientDirection.RightBottom,
                            colors: [['#007DFF', 0.0], ['#0052CC', 1.0]]
                        });
                        Column.borderRadius(8);
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.resultBook!.title);
                        Text.fontSize(12);
                        Text.fontColor('#FFFFFF');
                        Text.maxLines(3);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                        Text.textAlign(TextAlign.Center);
                        Text.padding({ left: 4, right: 4 });
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
            Column.margin({ left: 12 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.resultBook!.title);
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#181818');
            Text.maxLines(2);
            Text.textOverflow({ overflow: TextOverflow.Ellipsis });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.resultBook!.author) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`作者: ${this.resultBook!.author}`);
                        Text.fontSize(13);
                        Text.fontColor('#999999');
                        Text.margin({ top: 6 });
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.resultBook!.format.toUpperCase());
            Text.fontSize(13);
            Text.fontColor('#999999');
            Text.margin({ top: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('图书');
            Text.fontSize(12);
            Text.fontColor('#007DFF');
            Text.backgroundColor('#EBF1FF');
            Text.borderRadius(8);
            Text.padding({ left: 8, right: 8, top: 2, bottom: 2 });
            Text.margin({ top: 8 });
        }, Text);
        Text.pop();
        Column.pop();
        Row.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "RandomPage";
    }
}
registerNamedRoute(() => new RandomPage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/RandomPage", pageFullPath: "entry/src/main/ets/pages/RandomPage", integratedHsp: "false", moduleType: "followWithHap" });
