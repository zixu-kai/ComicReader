if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface BookDetailPage_Params {
    book?: Book | null;
    rating?: number;
    readingStatus?: string;
    bookId?: number;
    isBookmarked?: boolean;
    showEditDialog?: boolean;
    showCoverDialog?: boolean;
    editTitle?: string;
    editAuthor?: string;
    editDescription?: string;
    editPublisher?: string;
    editLanguage?: string;
    editIsbn?: string;
    toastMessage?: string;
    showToast?: boolean;
}
import { navigateTo, NavParams } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
import { BookService, BookmarkService } from "@bundle:com.comicreader.harmony/entry/ets/service/ComicService";
import { Book } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
import type { Tag, BookmarkItem } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
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
class BookDetailPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__book = new ObservedPropertyObjectPU(null, this, "book");
        this.__rating = new ObservedPropertySimplePU(0, this, "rating");
        this.__readingStatus = new ObservedPropertySimplePU('', this, "readingStatus");
        this.__bookId = new ObservedPropertySimplePU(0, this, "bookId");
        this.__isBookmarked = new ObservedPropertySimplePU(false, this, "isBookmarked");
        this.__showEditDialog = new ObservedPropertySimplePU(false, this, "showEditDialog");
        this.__showCoverDialog = new ObservedPropertySimplePU(false, this, "showCoverDialog");
        this.__editTitle = new ObservedPropertySimplePU('', this, "editTitle");
        this.__editAuthor = new ObservedPropertySimplePU('', this, "editAuthor");
        this.__editDescription = new ObservedPropertySimplePU('', this, "editDescription");
        this.__editPublisher = new ObservedPropertySimplePU('', this, "editPublisher");
        this.__editLanguage = new ObservedPropertySimplePU('', this, "editLanguage");
        this.__editIsbn = new ObservedPropertySimplePU('', this, "editIsbn");
        this.__toastMessage = new ObservedPropertySimplePU('', this, "toastMessage");
        this.__showToast = new ObservedPropertySimplePU(false, this, "showToast");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: BookDetailPage_Params) {
        if (params.book !== undefined) {
            this.book = params.book;
        }
        if (params.rating !== undefined) {
            this.rating = params.rating;
        }
        if (params.readingStatus !== undefined) {
            this.readingStatus = params.readingStatus;
        }
        if (params.bookId !== undefined) {
            this.bookId = params.bookId;
        }
        if (params.isBookmarked !== undefined) {
            this.isBookmarked = params.isBookmarked;
        }
        if (params.showEditDialog !== undefined) {
            this.showEditDialog = params.showEditDialog;
        }
        if (params.showCoverDialog !== undefined) {
            this.showCoverDialog = params.showCoverDialog;
        }
        if (params.editTitle !== undefined) {
            this.editTitle = params.editTitle;
        }
        if (params.editAuthor !== undefined) {
            this.editAuthor = params.editAuthor;
        }
        if (params.editDescription !== undefined) {
            this.editDescription = params.editDescription;
        }
        if (params.editPublisher !== undefined) {
            this.editPublisher = params.editPublisher;
        }
        if (params.editLanguage !== undefined) {
            this.editLanguage = params.editLanguage;
        }
        if (params.editIsbn !== undefined) {
            this.editIsbn = params.editIsbn;
        }
        if (params.toastMessage !== undefined) {
            this.toastMessage = params.toastMessage;
        }
        if (params.showToast !== undefined) {
            this.showToast = params.showToast;
        }
    }
    updateStateVars(params: BookDetailPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__book.purgeDependencyOnElmtId(rmElmtId);
        this.__rating.purgeDependencyOnElmtId(rmElmtId);
        this.__readingStatus.purgeDependencyOnElmtId(rmElmtId);
        this.__bookId.purgeDependencyOnElmtId(rmElmtId);
        this.__isBookmarked.purgeDependencyOnElmtId(rmElmtId);
        this.__showEditDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__showCoverDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__editTitle.purgeDependencyOnElmtId(rmElmtId);
        this.__editAuthor.purgeDependencyOnElmtId(rmElmtId);
        this.__editDescription.purgeDependencyOnElmtId(rmElmtId);
        this.__editPublisher.purgeDependencyOnElmtId(rmElmtId);
        this.__editLanguage.purgeDependencyOnElmtId(rmElmtId);
        this.__editIsbn.purgeDependencyOnElmtId(rmElmtId);
        this.__toastMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__showToast.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__book.aboutToBeDeleted();
        this.__rating.aboutToBeDeleted();
        this.__readingStatus.aboutToBeDeleted();
        this.__bookId.aboutToBeDeleted();
        this.__isBookmarked.aboutToBeDeleted();
        this.__showEditDialog.aboutToBeDeleted();
        this.__showCoverDialog.aboutToBeDeleted();
        this.__editTitle.aboutToBeDeleted();
        this.__editAuthor.aboutToBeDeleted();
        this.__editDescription.aboutToBeDeleted();
        this.__editPublisher.aboutToBeDeleted();
        this.__editLanguage.aboutToBeDeleted();
        this.__editIsbn.aboutToBeDeleted();
        this.__toastMessage.aboutToBeDeleted();
        this.__showToast.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __book: ObservedPropertyObjectPU<Book | null>;
    get book() {
        return this.__book.get();
    }
    set book(newValue: Book | null) {
        this.__book.set(newValue);
    }
    private __rating: ObservedPropertySimplePU<number>;
    get rating() {
        return this.__rating.get();
    }
    set rating(newValue: number) {
        this.__rating.set(newValue);
    }
    private __readingStatus: ObservedPropertySimplePU<string>;
    get readingStatus() {
        return this.__readingStatus.get();
    }
    set readingStatus(newValue: string) {
        this.__readingStatus.set(newValue);
    }
    private __bookId: ObservedPropertySimplePU<number>;
    get bookId() {
        return this.__bookId.get();
    }
    set bookId(newValue: number) {
        this.__bookId.set(newValue);
    }
    private __isBookmarked: ObservedPropertySimplePU<boolean>;
    get isBookmarked() {
        return this.__isBookmarked.get();
    }
    set isBookmarked(newValue: boolean) {
        this.__isBookmarked.set(newValue);
    }
    private __showEditDialog: ObservedPropertySimplePU<boolean>;
    get showEditDialog() {
        return this.__showEditDialog.get();
    }
    set showEditDialog(newValue: boolean) {
        this.__showEditDialog.set(newValue);
    }
    private __showCoverDialog: ObservedPropertySimplePU<boolean>;
    get showCoverDialog() {
        return this.__showCoverDialog.get();
    }
    set showCoverDialog(newValue: boolean) {
        this.__showCoverDialog.set(newValue);
    }
    private __editTitle: ObservedPropertySimplePU<string>;
    get editTitle() {
        return this.__editTitle.get();
    }
    set editTitle(newValue: string) {
        this.__editTitle.set(newValue);
    }
    private __editAuthor: ObservedPropertySimplePU<string>;
    get editAuthor() {
        return this.__editAuthor.get();
    }
    set editAuthor(newValue: string) {
        this.__editAuthor.set(newValue);
    }
    private __editDescription: ObservedPropertySimplePU<string>;
    get editDescription() {
        return this.__editDescription.get();
    }
    set editDescription(newValue: string) {
        this.__editDescription.set(newValue);
    }
    private __editPublisher: ObservedPropertySimplePU<string>;
    get editPublisher() {
        return this.__editPublisher.get();
    }
    set editPublisher(newValue: string) {
        this.__editPublisher.set(newValue);
    }
    private __editLanguage: ObservedPropertySimplePU<string>;
    get editLanguage() {
        return this.__editLanguage.get();
    }
    set editLanguage(newValue: string) {
        this.__editLanguage.set(newValue);
    }
    private __editIsbn: ObservedPropertySimplePU<string>;
    get editIsbn() {
        return this.__editIsbn.get();
    }
    set editIsbn(newValue: string) {
        this.__editIsbn.set(newValue);
    }
    private __toastMessage: ObservedPropertySimplePU<string>;
    get toastMessage() {
        return this.__toastMessage.get();
    }
    set toastMessage(newValue: string) {
        this.__toastMessage.set(newValue);
    }
    private __showToast: ObservedPropertySimplePU<boolean>;
    get showToast() {
        return this.__showToast.get();
    }
    set showToast(newValue: boolean) {
        this.__showToast.set(newValue);
    }
    aboutToAppear(): void {
        const params = this.getUIContext().getRouter().getParams() as Record<string, number>;
        if (params && params.bookId) {
            this.bookId = params.bookId;
            this.loadBook();
            this.loadBookmarkStatus();
        }
    }
    async loadBook(): Promise<void> {
        try {
            this.book = await BookService.getBook(this.bookId);
            if (this.book) {
                if (this.book.rating) {
                    this.rating = this.book.rating.score;
                    this.readingStatus = this.book.rating.readingStatus;
                }
            }
        }
        catch (e) {
            console.error('Failed to load book: ' + JSON.stringify(e));
        }
    }
    async loadBookmarkStatus(): Promise<void> {
        try {
            const bmList: BookmarkItem[] = await BookmarkService.getBookmarks();
            const bm = bmList[0];
            if (bm) {
                this.isBookmarked = (bm.bookIds || []).includes(this.bookId);
            }
        }
        catch (e) {
            console.error('Failed to load bookmark status: ' + JSON.stringify(e));
        }
    }
    async setRating(score: number): Promise<void> {
        try {
            const status = this.readingStatus || 'want_to_read';
            await BookService.setRating(this.bookId, score, status);
            this.rating = score;
            this.showMessage('评分已更新');
        }
        catch (e) {
            console.error('Failed to set rating: ' + JSON.stringify(e));
        }
    }
    async setReadingStatus(status: string): Promise<void> {
        try {
            const score = this.rating || 0;
            await BookService.setRating(this.bookId, score, status);
            this.readingStatus = status;
        }
        catch (e) {
            console.error('Failed to set reading status: ' + JSON.stringify(e));
        }
    }
    onDeleteBook(): void {
        AlertDialog.show({
            title: '确认删除',
            message: `确定要删除「${this.book?.title}」吗？此操作不可恢复。`,
            primaryButton: {
                value: '取消',
                action: () => { }
            },
            secondaryButton: {
                value: '删除',
                action: async () => {
                    try {
                        await BookService.deleteBook(this.bookId);
                        try {
                            this.getUIContext().getRouter().back();
                        }
                        catch (e) {
                            console.error('Back failed: ' + JSON.stringify(e));
                        }
                    }
                    catch (e) {
                        console.error('Failed to delete book: ' + JSON.stringify(e));
                    }
                }
            }
        });
    }
    onStartReading(): void {
        let p = new NavParams();
        p.bookId = this.bookId;
        navigateTo(this.getUIContext(), 'pages/BookReaderPage', p);
    }
    async toggleBookmark(): Promise<void> {
        try {
            const bmList: BookmarkItem[] = await BookmarkService.getBookmarks();
            if (bmList.length === 0) {
                this.showMessage('暂无收藏列表');
                return;
            }
            const bm = bmList[0];
            if (this.isBookmarked) {
                await BookmarkService.removeBook(bm.id, this.bookId);
                this.isBookmarked = false;
                this.showMessage('已取消收藏');
            }
            else {
                await BookmarkService.addBook(bm.id, this.bookId);
                this.isBookmarked = true;
                this.showMessage('已添加收藏');
            }
        }
        catch (e) {
            this.showMessage('操作失败，请重试');
        }
    }
    onOpenEditDialog(): void {
        if (this.book) {
            this.editTitle = this.book.title || '';
            this.editAuthor = this.book.author || '';
            this.editDescription = this.book.description || '';
            this.editPublisher = this.book.publisher || '';
            this.editLanguage = this.book.language || '';
            this.editIsbn = this.book.isbn || '';
            this.showEditDialog = true;
        }
    }
    async onSaveEdit(): Promise<void> {
        try {
            const updatedBook = new Book();
            updatedBook.title = this.editTitle;
            updatedBook.author = this.editAuthor;
            updatedBook.description = this.editDescription;
            updatedBook.publisher = this.editPublisher;
            updatedBook.language = this.editLanguage;
            updatedBook.isbn = this.editIsbn;
            await BookService.updateBook(this.bookId, updatedBook);
            this.showEditDialog = false;
            this.showMessage('已保存修改');
            await this.loadBook();
        }
        catch (e) {
            this.showMessage('保存失败');
        }
    }
    showMessage(msg: string): void {
        this.toastMessage = msg;
        this.showToast = true;
        setTimeout(() => {
            this.showToast = false;
        }, 2000);
    }
    onDownload(): void {
        try {
            const url = BookService.getCoverUrl(this.bookId);
            this.showMessage('下载链接: ' + url);
        }
        catch (e) {
            this.showMessage('下载失败');
        }
    }
    onExportEpub(): void {
        if (this.book && this.book.format === 'txt') {
            this.showMessage('正在导出 EPUB...');
            setTimeout(() => {
                this.showMessage('EPUB 导出功能需要通过接口触发');
            }, 1000);
        }
        else if (this.book) {
            this.showMessage('仅支持 TXT 格式导出 EPUB');
        }
        else {
            this.showMessage('无法执行导出');
        }
    }
    getFormatLabel(format: string): string {
        switch (format) {
            case 'pdf':
                return 'PDF';
            case 'epub':
                return 'EPUB';
            case 'txt':
                return 'TXT';
            default:
                return format.toUpperCase();
        }
    }
    getFormatColor(format: string): string {
        switch (format) {
            case 'pdf':
                return '#EF4444';
            case 'epub':
                return '#22C55E';
            case 'txt':
                return '#F59E0B';
            default:
                return '#9CA3AF';
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
            If.create();
            if (this.showToast) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.padding(12);
                        Row.backgroundColor('#374151');
                        Row.justifyContent(FlexAlign.Center);
                        Row.position({ x: 0, y: 56 });
                        Row.zIndex(100);
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.toastMessage);
                        Text.fontSize(14);
                        Text.fontColor('#FFFFFF');
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
            Text.create('图书详情');
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
            If.create();
            if (this.book) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Scroll.create();
                        Scroll.layoutWeight(1);
                        Scroll.width('100%');
                        Scroll.scrollBar(BarState.Auto);
                    }, Scroll);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.padding({ left: 16, right: 16, bottom: 24 });
                    }, Column);
                    this.CoverSection.bind(this)();
                    this.InfoSection.bind(this)();
                    this.RatingSection.bind(this)();
                    this.ReadingStatusSection.bind(this)();
                    this.ActionButtons.bind(this)();
                    this.CategoriesAndTags.bind(this)();
                    Column.pop();
                    Scroll.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.layoutWeight(1);
                        Column.width('100%');
                        Column.justifyContent(FlexAlign.Center);
                        Column.alignItems(HorizontalAlign.Center);
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        LoadingProgress.create();
                        LoadingProgress.width(48);
                        LoadingProgress.height(48);
                        LoadingProgress.color('#8B5CF6');
                    }, LoadingProgress);
                    Column.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.showEditDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.EditDialog.bind(this)();
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
            if (this.showCoverDialog) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.CoverDialog.bind(this)();
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
    CoverSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.borderRadius(12);
            Column.clip(true);
            Column.margin({ top: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.width('100%');
            Stack.height(320);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create(BookService.getCoverUrl(this.bookId));
            Image.width('100%');
            Image.height(320);
            Image.objectFit(ImageFit.Cover);
            Image.borderRadius({ topLeft: 12, topRight: 12 });
            Image.interpolation(ImageInterpolation.High);
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.height(320);
            Column.backgroundColor('#66000000');
            Column.borderRadius({ topLeft: 12, topRight: 12 });
            Column.justifyContent(FlexAlign.Center);
            Column.alignItems(HorizontalAlign.Center);
            Column.opacity(0);
            Column.onClick(() => {
                this.showCoverDialog = true;
            });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('更换封面');
            Text.fontSize(12);
            Text.fontColor('#FFFFFF');
        }, Text);
        Text.pop();
        Column.pop();
        Stack.pop();
        Column.pop();
    }
    InfoSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#1F2937');
            Column.borderRadius(12);
            Column.margin({ top: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.book!.title);
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#E5E7EB');
            Text.width('100%');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.book!.author) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ top: 6 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('作者: ');
                        Text.fontSize(14);
                        Text.fontColor('#9CA3AF');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.book!.author);
                        Text.fontSize(14);
                        Text.fontColor('#E5E7EB');
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
            If.create();
            if (this.book!.description) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.book!.description);
                        Text.fontSize(13);
                        Text.fontColor('#9CA3AF');
                        Text.width('100%');
                        Text.margin({ top: 8 });
                        Text.maxLines(4);
                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
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
            Flex.create({ wrap: FlexWrap.Wrap });
            Flex.width('100%');
            Flex.margin({ top: 10 });
        }, Flex);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.backgroundColor('#1F2937');
            Row.borderRadius(6);
            Row.padding({ left: 8, right: 8, top: 4, bottom: 4 });
            Row.margin({ right: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.getFormatLabel(this.book!.format));
            Text.fontSize(12);
            Text.fontColor(this.getFormatColor(this.book!.format));
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.book!.pageCount !== null && this.book!.pageCount! > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.backgroundColor('#1F2937');
                        Row.borderRadius(6);
                        Row.padding({ left: 8, right: 8, top: 4, bottom: 4 });
                        Row.margin({ right: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.book!.pageCount} 页`);
                        Text.fontSize(12);
                        Text.fontColor('#9CA3AF');
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
            Row.create();
            Row.backgroundColor('#1F2937');
            Row.borderRadius(6);
            Row.padding({ left: 8, right: 8, top: 4, bottom: 4 });
            Row.margin({ right: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(formatFileSize(this.book!.fileSize));
            Text.fontSize(12);
            Text.fontColor('#9CA3AF');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.book!.publisher) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.backgroundColor('#1F2937');
                        Row.borderRadius(6);
                        Row.padding({ left: 8, right: 8, top: 4, bottom: 4 });
                        Row.margin({ right: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.book!.publisher);
                        Text.fontSize(12);
                        Text.fontColor('#9CA3AF');
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
            If.create();
            if (this.book!.language) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.backgroundColor('#1F2937');
                        Row.borderRadius(6);
                        Row.padding({ left: 8, right: 8, top: 4, bottom: 4 });
                        Row.margin({ right: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.book!.language.toUpperCase());
                        Text.fontSize(12);
                        Text.fontColor('#9CA3AF');
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
            If.create();
            if (this.book!.isbn) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.backgroundColor('#1F2937');
                        Row.borderRadius(6);
                        Row.padding({ left: 8, right: 8, top: 4, bottom: 4 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`ISBN: ${this.book!.isbn}`);
                        Text.fontSize(12);
                        Text.fontColor('#9CA3AF');
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
        Flex.pop();
        Column.pop();
    }
    RatingSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#1F2937');
            Column.borderRadius(12);
            Column.margin({ top: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('评分');
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#E5E7EB');
            Text.width('100%');
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.justifyContent(FlexAlign.Center);
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            ForEach.create();
            const forEachItemGenFunction = _item => {
                const star = _item;
                this.observeComponentCreation2((elmtId, isInitialRender) => {
                    Text.create(star <= this.rating ? '★' : '☆');
                    Text.fontSize(32);
                    Text.fontColor(star <= this.rating ? '#FBBF24' : '#4B5563');
                    Text.margin({ right: 8 });
                    Text.onClick(() => {
                        this.setRating(star);
                    });
                }, Text);
                Text.pop();
            };
            this.forEachUpdateFunction(elmtId, [1, 2, 3, 4, 5], forEachItemGenFunction);
        }, ForEach);
        ForEach.pop();
        Row.pop();
        Column.pop();
    }
    ReadingStatusSection(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.padding(16);
            Column.backgroundColor('#1F2937');
            Column.borderRadius(12);
            Column.margin({ top: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('阅读状态');
            Text.fontSize(16);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#E5E7EB');
            Text.width('100%');
            Text.margin({ bottom: 12 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.justifyContent(FlexAlign.SpaceBetween);
        }, Row);
        this.StatusButton.bind(this)('想读', 'want_to_read');
        this.StatusButton.bind(this)('在读', 'reading');
        this.StatusButton.bind(this)('已读', 'read');
        this.StatusButton.bind(this)('弃读', 'dropped');
        Row.pop();
        Column.pop();
    }
    StatusButton(label: string, status: string, parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(label);
            Text.fontSize(14);
            Text.fontColor(this.readingStatus === status ? '#FFFFFF' : '#9CA3AF');
            Text.backgroundColor(this.readingStatus === status ? '#8B5CF6' : '#374151');
            Text.borderRadius(8);
            Text.padding({ left: 16, right: 16, top: 8, bottom: 8 });
            Text.onClick(() => {
                this.setReadingStatus(status);
            });
        }, Text);
        Text.pop();
    }
    ActionButtons(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.margin({ top: 12 });
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('开始阅读');
            Button.fontSize(16);
            Button.fontWeight(FontWeight.Medium);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#8B5CF6');
            Button.borderRadius(10);
            Button.layoutWeight(1);
            Button.height(48);
            Button.onClick(() => {
                this.onStartReading();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel(this.isBookmarked ? '已收藏' : '收藏');
            Button.fontSize(16);
            Button.fontWeight(FontWeight.Medium);
            Button.fontColor(this.isBookmarked ? '#8B5CF6' : '#9CA3AF');
            Button.border({ width: 1, color: this.isBookmarked ? '#8B5CF6' : '#374151' });
            Button.backgroundColor(this.isBookmarked ? '#2E1065' : '#374151');
            Button.borderRadius(10);
            Button.width(80);
            Button.height(48);
            Button.margin({ left: 8 });
            Button.onClick(() => {
                this.toggleBookmark();
            });
        }, Button);
        Button.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('编辑信息');
            Button.fontSize(14);
            Button.fontColor('#9CA3AF');
            Button.backgroundColor('#374151');
            Button.borderRadius(10);
            Button.layoutWeight(1);
            Button.height(40);
            Button.onClick(() => {
                this.onOpenEditDialog();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('下载');
            Button.fontSize(14);
            Button.fontColor('#9CA3AF');
            Button.backgroundColor('#374151');
            Button.borderRadius(10);
            Button.layoutWeight(1);
            Button.height(40);
            Button.margin({ left: 8 });
            Button.onClick(() => {
                this.onDownload();
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.book!.format === 'txt') {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Button.createWithLabel('导出EPUB');
                        Button.fontSize(14);
                        Button.fontColor('#22C55E');
                        Button.backgroundColor('#374151');
                        Button.borderRadius(10);
                        Button.layoutWeight(1);
                        Button.height(40);
                        Button.margin({ left: 8 });
                        Button.onClick(() => {
                            this.onExportEpub();
                        });
                    }, Button);
                    Button.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('删除');
            Button.fontSize(14);
            Button.fontColor('#EF4444');
            Button.backgroundColor('#374151');
            Button.borderRadius(10);
            Button.width(80);
            Button.height(40);
            Button.margin({ left: 8 });
            Button.onClick(() => {
                this.onDeleteBook();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    CategoriesAndTags(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.book!.tags && this.book!.tags.length > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Column.create();
                        Column.width('100%');
                        Column.padding(16);
                        Column.backgroundColor('#1F2937');
                        Column.borderRadius(12);
                        Column.margin({ top: 12 });
                    }, Column);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('标签');
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#E5E7EB');
                        Text.width('100%');
                        Text.margin({ bottom: 8 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Flex.create({ wrap: FlexWrap.Wrap });
                        Flex.width('100%');
                    }, Flex);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const tag = _item;
                            this.observeComponentCreation2((elmtId, isInitialRender) => {
                                Text.create(tag.name);
                                Text.fontSize(13);
                                Text.fontColor('#A78BFA');
                                Text.backgroundColor('#2E1065');
                                Text.borderRadius(16);
                                Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
                                Text.margin({ right: 8, bottom: 8 });
                                Text.onClick(() => {
                                    let p = new NavParams();
                                    p.tagId = tag.id;
                                    navigateTo(this.getUIContext(), 'pages/BookLibraryPage', p);
                                });
                            }, Text);
                            Text.pop();
                        };
                        this.forEachUpdateFunction(elmtId, this.book!.tags, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
                    Flex.pop();
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
    EditDialog(parent = null) {
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
            Column.width('85%');
            Column.backgroundColor('#1F2937');
            Column.borderRadius(16);
            Column.padding(24);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('编辑图书信息');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#E5E7EB');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 125831084, "type": 20000, params: [], "bundleName": "com.comicreader.harmony", "moduleName": "entry" });
            Image.width(20);
            Image.height(20);
            Image.fillColor('#9CA3AF');
            Image.onClick(() => {
                this.showEditDialog = false;
            });
        }, Image);
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('标题');
            Text.fontSize(13);
            Text.fontColor('#9CA3AF');
            Text.width('100%');
            Text.margin({ bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.editTitle, placeholder: '输入标题' });
            TextInput.width('100%');
            TextInput.height(40);
            TextInput.fontColor('#E5E7EB');
            TextInput.backgroundColor('#374151');
            TextInput.borderRadius(8);
            TextInput.onChange((value: string) => {
                this.editTitle = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('作者');
            Text.fontSize(13);
            Text.fontColor('#9CA3AF');
            Text.width('100%');
            Text.margin({ top: 12, bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.editAuthor, placeholder: '输入作者' });
            TextInput.width('100%');
            TextInput.height(40);
            TextInput.fontColor('#E5E7EB');
            TextInput.backgroundColor('#374151');
            TextInput.borderRadius(8);
            TextInput.onChange((value: string) => {
                this.editAuthor = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('简介');
            Text.fontSize(13);
            Text.fontColor('#9CA3AF');
            Text.width('100%');
            Text.margin({ top: 12, bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.editDescription, placeholder: '输入简介' });
            TextInput.width('100%');
            TextInput.height(80);
            TextInput.fontColor('#E5E7EB');
            TextInput.backgroundColor('#374151');
            TextInput.borderRadius(8);
            TextInput.onChange((value: string) => {
                this.editDescription = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('出版社');
            Text.fontSize(13);
            Text.fontColor('#9CA3AF');
            Text.width('100%');
            Text.margin({ top: 12, bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.editPublisher, placeholder: '输入出版社' });
            TextInput.width('100%');
            TextInput.height(40);
            TextInput.fontColor('#E5E7EB');
            TextInput.backgroundColor('#374151');
            TextInput.borderRadius(8);
            TextInput.onChange((value: string) => {
                this.editPublisher = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('语言');
            Text.fontSize(13);
            Text.fontColor('#9CA3AF');
            Text.width('100%');
            Text.margin({ top: 12, bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.editLanguage, placeholder: '输入语言 (如 zh, en)' });
            TextInput.width('100%');
            TextInput.height(40);
            TextInput.fontColor('#E5E7EB');
            TextInput.backgroundColor('#374151');
            TextInput.borderRadius(8);
            TextInput.onChange((value: string) => {
                this.editLanguage = value;
            });
        }, TextInput);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('ISBN');
            Text.fontSize(13);
            Text.fontColor('#9CA3AF');
            Text.width('100%');
            Text.margin({ top: 12, bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.editIsbn, placeholder: '输入ISBN' });
            TextInput.width('100%');
            TextInput.height(40);
            TextInput.fontColor('#E5E7EB');
            TextInput.backgroundColor('#374151');
            TextInput.borderRadius(8);
            TextInput.onChange((value: string) => {
                this.editIsbn = value;
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
            Button.fontColor('#9CA3AF');
            Button.backgroundColor('#374151');
            Button.borderRadius(20);
            Button.onClick(() => {
                this.showEditDialog = false;
            });
        }, Button);
        Button.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('保存');
            Button.layoutWeight(1);
            Button.height(40);
            Button.fontSize(14);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#8B5CF6');
            Button.borderRadius(20);
            Button.margin({ left: 12 });
            Button.onClick(() => {
                this.onSaveEdit();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
        Column.pop();
    }
    CoverDialog(parent = null) {
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
            Column.width('85%');
            Column.backgroundColor('#1F2937');
            Column.borderRadius(16);
            Column.padding(24);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.margin({ bottom: 16 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('更换封面');
            Text.fontSize(18);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#E5E7EB');
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Blank.create();
        }, Blank);
        Blank.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create({ "id": 125831084, "type": 20000, params: [], "bundleName": "com.comicreader.harmony", "moduleName": "entry" });
            Image.width(20);
            Image.height(20);
            Image.fillColor('#9CA3AF');
            Image.onClick(() => {
                this.showCoverDialog = false;
            });
        }, Image);
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('当前封面');
            Text.fontSize(13);
            Text.fontColor('#9CA3AF');
            Text.width('100%');
            Text.margin({ bottom: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Image.create(BookService.getCoverUrl(this.bookId));
            Image.width('100%');
            Image.height(200);
            Image.objectFit(ImageFit.Cover);
            Image.borderRadius(8);
        }, Image);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('提示：请通过服务端接口上传新封面');
            Text.fontSize(12);
            Text.fontColor('#6B7280');
            Text.width('100%');
            Text.margin({ top: 12 });
            Text.textAlign(TextAlign.Center);
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Button.createWithLabel('关闭');
            Button.width('100%');
            Button.height(40);
            Button.fontSize(14);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#8B5CF6');
            Button.borderRadius(20);
            Button.margin({ top: 16 });
            Button.onClick(() => {
                this.showCoverDialog = false;
            });
        }, Button);
        Button.pop();
        Column.pop();
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
    static getEntryName(): string {
        return "BookDetailPage";
    }
}
registerNamedRoute(() => new BookDetailPage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/BookDetailPage", pageFullPath: "entry/src/main/ets/pages/BookDetailPage", integratedHsp: "false", moduleType: "followWithHap" });
