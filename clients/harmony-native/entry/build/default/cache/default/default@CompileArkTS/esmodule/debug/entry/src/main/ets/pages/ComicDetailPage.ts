if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ComicDetailPage_Params {
    comic?: Comic | null;
    chapters?: Chapter[];
    rating?: number;
    readingStatus?: string;
    comicId?: number;
    currentChapterId?: number;
    isBookmarked?: boolean;
    bookmarkList?: BookmarkItem[];
    showEditDialog?: boolean;
    showCoverDialog?: boolean;
    editTitle?: string;
    editAuthor?: string;
    editArtist?: string;
    editDescription?: string;
    editStatus?: string;
    toastMessage?: string;
    showToast?: boolean;
}
import { navigateTo, NavParams } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
import { ComicService, BookmarkService } from "@bundle:com.comicreader.harmony/entry/ets/service/ComicService";
import { Comic } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
import type { Chapter, Category, Tag, BookmarkItem } from "@bundle:com.comicreader.harmony/entry/ets/model/ComicModels";
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
class ComicDetailPage extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__comic = new ObservedPropertyObjectPU(null, this, "comic");
        this.__chapters = new ObservedPropertyObjectPU([], this, "chapters");
        this.__rating = new ObservedPropertySimplePU(0, this, "rating");
        this.__readingStatus = new ObservedPropertySimplePU('', this, "readingStatus");
        this.__comicId = new ObservedPropertySimplePU(0, this, "comicId");
        this.__currentChapterId = new ObservedPropertySimplePU(0, this, "currentChapterId");
        this.__isBookmarked = new ObservedPropertySimplePU(false, this, "isBookmarked");
        this.__bookmarkList = new ObservedPropertyObjectPU([], this, "bookmarkList");
        this.__showEditDialog = new ObservedPropertySimplePU(false, this, "showEditDialog");
        this.__showCoverDialog = new ObservedPropertySimplePU(false, this, "showCoverDialog");
        this.__editTitle = new ObservedPropertySimplePU('', this, "editTitle");
        this.__editAuthor = new ObservedPropertySimplePU('', this, "editAuthor");
        this.__editArtist = new ObservedPropertySimplePU('', this, "editArtist");
        this.__editDescription = new ObservedPropertySimplePU('', this, "editDescription");
        this.__editStatus = new ObservedPropertySimplePU('unknown', this, "editStatus");
        this.__toastMessage = new ObservedPropertySimplePU('', this, "toastMessage");
        this.__showToast = new ObservedPropertySimplePU(false, this, "showToast");
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ComicDetailPage_Params) {
        if (params.comic !== undefined) {
            this.comic = params.comic;
        }
        if (params.chapters !== undefined) {
            this.chapters = params.chapters;
        }
        if (params.rating !== undefined) {
            this.rating = params.rating;
        }
        if (params.readingStatus !== undefined) {
            this.readingStatus = params.readingStatus;
        }
        if (params.comicId !== undefined) {
            this.comicId = params.comicId;
        }
        if (params.currentChapterId !== undefined) {
            this.currentChapterId = params.currentChapterId;
        }
        if (params.isBookmarked !== undefined) {
            this.isBookmarked = params.isBookmarked;
        }
        if (params.bookmarkList !== undefined) {
            this.bookmarkList = params.bookmarkList;
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
        if (params.editArtist !== undefined) {
            this.editArtist = params.editArtist;
        }
        if (params.editDescription !== undefined) {
            this.editDescription = params.editDescription;
        }
        if (params.editStatus !== undefined) {
            this.editStatus = params.editStatus;
        }
        if (params.toastMessage !== undefined) {
            this.toastMessage = params.toastMessage;
        }
        if (params.showToast !== undefined) {
            this.showToast = params.showToast;
        }
    }
    updateStateVars(params: ComicDetailPage_Params) {
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__comic.purgeDependencyOnElmtId(rmElmtId);
        this.__chapters.purgeDependencyOnElmtId(rmElmtId);
        this.__rating.purgeDependencyOnElmtId(rmElmtId);
        this.__readingStatus.purgeDependencyOnElmtId(rmElmtId);
        this.__comicId.purgeDependencyOnElmtId(rmElmtId);
        this.__currentChapterId.purgeDependencyOnElmtId(rmElmtId);
        this.__isBookmarked.purgeDependencyOnElmtId(rmElmtId);
        this.__bookmarkList.purgeDependencyOnElmtId(rmElmtId);
        this.__showEditDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__showCoverDialog.purgeDependencyOnElmtId(rmElmtId);
        this.__editTitle.purgeDependencyOnElmtId(rmElmtId);
        this.__editAuthor.purgeDependencyOnElmtId(rmElmtId);
        this.__editArtist.purgeDependencyOnElmtId(rmElmtId);
        this.__editDescription.purgeDependencyOnElmtId(rmElmtId);
        this.__editStatus.purgeDependencyOnElmtId(rmElmtId);
        this.__toastMessage.purgeDependencyOnElmtId(rmElmtId);
        this.__showToast.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__comic.aboutToBeDeleted();
        this.__chapters.aboutToBeDeleted();
        this.__rating.aboutToBeDeleted();
        this.__readingStatus.aboutToBeDeleted();
        this.__comicId.aboutToBeDeleted();
        this.__currentChapterId.aboutToBeDeleted();
        this.__isBookmarked.aboutToBeDeleted();
        this.__bookmarkList.aboutToBeDeleted();
        this.__showEditDialog.aboutToBeDeleted();
        this.__showCoverDialog.aboutToBeDeleted();
        this.__editTitle.aboutToBeDeleted();
        this.__editAuthor.aboutToBeDeleted();
        this.__editArtist.aboutToBeDeleted();
        this.__editDescription.aboutToBeDeleted();
        this.__editStatus.aboutToBeDeleted();
        this.__toastMessage.aboutToBeDeleted();
        this.__showToast.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __comic: ObservedPropertyObjectPU<Comic | null>;
    get comic() {
        return this.__comic.get();
    }
    set comic(newValue: Comic | null) {
        this.__comic.set(newValue);
    }
    private __chapters: ObservedPropertyObjectPU<Chapter[]>;
    get chapters() {
        return this.__chapters.get();
    }
    set chapters(newValue: Chapter[]) {
        this.__chapters.set(newValue);
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
    private __comicId: ObservedPropertySimplePU<number>;
    get comicId() {
        return this.__comicId.get();
    }
    set comicId(newValue: number) {
        this.__comicId.set(newValue);
    }
    private __currentChapterId: ObservedPropertySimplePU<number>;
    get currentChapterId() {
        return this.__currentChapterId.get();
    }
    set currentChapterId(newValue: number) {
        this.__currentChapterId.set(newValue);
    }
    private __isBookmarked: ObservedPropertySimplePU<boolean>;
    get isBookmarked() {
        return this.__isBookmarked.get();
    }
    set isBookmarked(newValue: boolean) {
        this.__isBookmarked.set(newValue);
    }
    private __bookmarkList: ObservedPropertyObjectPU<BookmarkItem[]>;
    get bookmarkList() {
        return this.__bookmarkList.get();
    }
    set bookmarkList(newValue: BookmarkItem[]) {
        this.__bookmarkList.set(newValue);
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
    private __editArtist: ObservedPropertySimplePU<string>;
    get editArtist() {
        return this.__editArtist.get();
    }
    set editArtist(newValue: string) {
        this.__editArtist.set(newValue);
    }
    private __editDescription: ObservedPropertySimplePU<string>;
    get editDescription() {
        return this.__editDescription.get();
    }
    set editDescription(newValue: string) {
        this.__editDescription.set(newValue);
    }
    private __editStatus: ObservedPropertySimplePU<string>;
    get editStatus() {
        return this.__editStatus.get();
    }
    set editStatus(newValue: string) {
        this.__editStatus.set(newValue);
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
        if (params && params.comicId) {
            this.comicId = params.comicId;
            this.loadComic();
            this.loadChapters();
            this.loadBookmarkStatus();
        }
    }
    async loadComic(): Promise<void> {
        try {
            this.comic = await ComicService.getComic(this.comicId);
            if (this.comic) {
                if (this.comic.rating) {
                    this.rating = this.comic.rating.score;
                    this.readingStatus = this.comic.rating.readingStatus;
                }
                if (this.comic.readingProgress) {
                    this.currentChapterId = this.comic.readingProgress.chapterId;
                }
            }
        }
        catch (e) {
            console.error('Failed to load comic: ' + JSON.stringify(e));
        }
    }
    async loadChapters(): Promise<void> {
        try {
            this.chapters = await ComicService.getChapters(this.comicId);
        }
        catch (e) {
            console.error('Failed to load chapters: ' + JSON.stringify(e));
        }
    }
    async loadBookmarkStatus(): Promise<void> {
        try {
            const bmList: BookmarkItem[] = await BookmarkService.getBookmarks();
            this.bookmarkList = bmList;
            const bm = bmList[0];
            if (bm) {
                this.isBookmarked = (bm.comicIds || []).includes(this.comicId);
            }
        }
        catch (e) {
            console.error('Failed to load bookmark status: ' + JSON.stringify(e));
        }
    }
    async setRating(score: number): Promise<void> {
        try {
            const status = this.readingStatus || 'want_to_read';
            await ComicService.setRating(this.comicId, score, status);
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
            await ComicService.setRating(this.comicId, score, status);
            this.readingStatus = status;
        }
        catch (e) {
            console.error('Failed to set reading status: ' + JSON.stringify(e));
        }
    }
    onDeleteComic(): void {
        AlertDialog.show({
            title: '确认删除',
            message: `确定要删除「${this.comic?.title}」吗？此操作不可恢复。`,
            primaryButton: {
                value: '取消',
                action: () => { }
            },
            secondaryButton: {
                value: '删除',
                action: async () => {
                    try {
                        await ComicService.deleteComic(this.comicId);
                        try {
                            this.getUIContext().getRouter().back();
                        }
                        catch (e) {
                            console.error('Back failed: ' + JSON.stringify(e));
                        }
                    }
                    catch (e) {
                        console.error('Failed to delete comic: ' + JSON.stringify(e));
                    }
                }
            }
        });
    }
    onReadChapter(chapterId: number): void {
        let p = new NavParams();
        p.comicId = this.comicId;
        p.chapterId = chapterId;
        navigateTo(this.getUIContext(), 'pages/ComicReaderPage', p);
    }
    onStartReading(): void {
        if (this.currentChapterId > 0) {
            this.onReadChapter(this.currentChapterId);
        }
        else if (this.chapters.length > 0) {
            this.onReadChapter(this.chapters[0].id);
        }
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
                await BookmarkService.removeComic(bm.id, this.comicId);
                this.isBookmarked = false;
                this.showMessage('已取消收藏');
            }
            else {
                await BookmarkService.addComic(bm.id, this.comicId);
                this.isBookmarked = true;
                this.showMessage('已添加收藏');
            }
        }
        catch (e) {
            this.showMessage('操作失败，请重试');
        }
    }
    onOpenEditDialog(): void {
        if (this.comic) {
            this.editTitle = this.comic.title || '';
            this.editAuthor = this.comic.author || '';
            this.editArtist = this.comic.artist || '';
            this.editDescription = this.comic.description || '';
            this.editStatus = this.comic.status || 'unknown';
            this.showEditDialog = true;
        }
    }
    async onSaveEdit(): Promise<void> {
        try {
            const updatedComic = new Comic();
            updatedComic.title = this.editTitle;
            updatedComic.author = this.editAuthor;
            updatedComic.artist = this.editArtist;
            updatedComic.description = this.editDescription;
            updatedComic.status = this.editStatus;
            await ComicService.updateComic(this.comicId, updatedComic);
            this.showEditDialog = false;
            this.showMessage('已保存修改');
            await this.loadComic();
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
            const url = ComicService.getCoverUrl(this.comicId);
            this.showMessage('下载链接: ' + url);
        }
        catch (e) {
            this.showMessage('下载失败');
        }
    }
    getStatusLabel(status: string): string {
        switch (status) {
            case 'ongoing':
                return '连载中';
            case 'completed':
                return '已完结';
            case 'unknown':
                return '未知';
            default:
                return status;
        }
    }
    getStatusColor(status: string): string {
        switch (status) {
            case 'ongoing':
                return '#22C55E';
            case 'completed':
                return '#6366F1';
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
            Text.create('漫画详情');
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
            if (this.comic) {
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
                    this.ChapterList.bind(this)();
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
                        LoadingProgress.color('#6366F1');
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
            Image.create(ComicService.getCoverUrl(this.comicId));
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
            Text.create(this.comic!.title);
            Text.fontSize(22);
            Text.fontWeight(FontWeight.Bold);
            Text.fontColor('#E5E7EB');
            Text.width('100%');
            Text.margin({ top: 16 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.comic!.author) {
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
                        Text.create(this.comic!.author);
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
            if (this.comic!.artist) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.width('100%');
                        Row.margin({ top: 4 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('画师: ');
                        Text.fontSize(14);
                        Text.fontColor('#9CA3AF');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.comic!.artist);
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
            if (this.comic!.description) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.comic!.description);
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
            If.create();
            if (this.comic!.year) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.backgroundColor('#1F2937');
                        Row.borderRadius(6);
                        Row.padding({ left: 8, right: 8, top: 4, bottom: 4 });
                        Row.margin({ right: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.comic!.year}`);
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
            Text.create(`${this.comic!.pageCount} 页`);
            Text.fontSize(12);
            Text.fontColor('#9CA3AF');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.backgroundColor('#1F2937');
            Row.borderRadius(6);
            Row.padding({ left: 8, right: 8, top: 4, bottom: 4 });
            Row.margin({ right: 8 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(formatFileSize(this.comic!.fileSize));
            Text.fontSize(12);
            Text.fontColor('#9CA3AF');
        }, Text);
        Text.pop();
        Row.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.comic!.fileType) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                        Row.backgroundColor('#1F2937');
                        Row.borderRadius(6);
                        Row.padding({ left: 8, right: 8, top: 4, bottom: 4 });
                        Row.margin({ right: 8 });
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.comic!.fileType.toUpperCase());
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
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.getStatusLabel(this.comic!.status));
            Text.fontSize(12);
            Text.fontColor(this.getStatusColor(this.comic!.status));
        }, Text);
        Text.pop();
        Row.pop();
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
            Text.backgroundColor(this.readingStatus === status ? '#6366F1' : '#374151');
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
            Button.createWithLabel(this.currentChapterId > 0 ? '继续阅读' : '开始阅读');
            Button.fontSize(16);
            Button.fontWeight(FontWeight.Medium);
            Button.fontColor('#FFFFFF');
            Button.backgroundColor('#6366F1');
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
            Button.fontColor(this.isBookmarked ? '#6366F1' : '#9CA3AF');
            Button.border({ width: 1, color: this.isBookmarked ? '#6366F1' : '#374151' });
            Button.backgroundColor(this.isBookmarked ? '#312E81' : '#374151');
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
            Button.createWithLabel('删除');
            Button.fontSize(14);
            Button.fontColor('#EF4444');
            Button.backgroundColor('#374151');
            Button.borderRadius(10);
            Button.width(80);
            Button.height(40);
            Button.margin({ left: 8 });
            Button.onClick(() => {
                this.onDeleteComic();
            });
        }, Button);
        Button.pop();
        Row.pop();
        Column.pop();
    }
    CategoriesAndTags(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if ((this.comic!.categories && this.comic!.categories.length > 0) ||
                (this.comic!.tags && this.comic!.tags.length > 0)) {
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
                        If.create();
                        if (this.comic!.categories && this.comic!.categories.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('分类');
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
                                        const category = _item;
                                        this.observeComponentCreation2((elmtId, isInitialRender) => {
                                            Text.create(category.name);
                                            Text.fontSize(13);
                                            Text.fontColor('#818CF8');
                                            Text.backgroundColor('#312E81');
                                            Text.borderRadius(16);
                                            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
                                            Text.margin({ right: 8, bottom: 8 });
                                            Text.onClick(() => {
                                                let p = new NavParams();
                                                p.categoryId = category.id;
                                                navigateTo(this.getUIContext(), 'pages/LibraryPage', p);
                                            });
                                        }, Text);
                                        Text.pop();
                                    };
                                    this.forEachUpdateFunction(elmtId, this.comic!.categories, forEachItemGenFunction);
                                }, ForEach);
                                ForEach.pop();
                                Flex.pop();
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
                        if (this.comic!.tags && this.comic!.tags.length > 0) {
                            this.ifElseBranchUpdateFunction(0, () => {
                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                    Text.create('标签');
                                    Text.fontSize(16);
                                    Text.fontWeight(FontWeight.Medium);
                                    Text.fontColor('#E5E7EB');
                                    Text.width('100%');
                                    Text.margin({ bottom: 8, top: this.comic!.categories.length > 0 ? 12 : 0 });
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
                                                navigateTo(this.getUIContext(), 'pages/LibraryPage', p);
                                            });
                                        }, Text);
                                        Text.pop();
                                    };
                                    this.forEachUpdateFunction(elmtId, this.comic!.tags, forEachItemGenFunction);
                                }, ForEach);
                                ForEach.pop();
                                Flex.pop();
                            });
                        }
                        else {
                            this.ifElseBranchUpdateFunction(1, () => {
                            });
                        }
                    }, If);
                    If.pop();
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
    ChapterList(parent = null) {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.chapters.length > 0) {
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
                        Text.create(`章节 (${this.chapters.length})`);
                        Text.fontSize(16);
                        Text.fontWeight(FontWeight.Medium);
                        Text.fontColor('#E5E7EB');
                        Text.width('100%');
                        Text.margin({ bottom: 12 });
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Grid.create();
                        Grid.columnsTemplate('1fr 1fr 1fr');
                        Grid.rowsGap(4);
                        Grid.columnsGap(4);
                        Grid.width('100%');
                    }, Grid);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        ForEach.create();
                        const forEachItemGenFunction = _item => {
                            const chapter = _item;
                            {
                                const itemCreation2 = (elmtId, isInitialRender) => {
                                    GridItem.create(() => { }, false);
                                    GridItem.padding(4);
                                };
                                const observedDeepRender = () => {
                                    this.observeComponentCreation2(itemCreation2, GridItem);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Column.create();
                                        Column.width('100%');
                                        Column.padding(10);
                                        Column.backgroundColor(chapter.id === this.currentChapterId ? '#312E81' : '#374151');
                                        Column.borderRadius(8);
                                        Column.border(chapter.id === this.currentChapterId ? {
                                            width: 1,
                                            color: '#6366F1'
                                        } : undefined);
                                        Column.onClick(() => {
                                            this.onReadChapter(chapter.id);
                                        });
                                    }, Column);
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        Text.create(chapter.title || `第${chapter.chapterNumber}话`);
                                        Text.fontSize(13);
                                        Text.fontColor(chapter.id === this.currentChapterId ? '#6366F1' : '#E5E7EB');
                                        Text.maxLines(1);
                                        Text.textOverflow({ overflow: TextOverflow.Ellipsis });
                                        Text.width('100%');
                                    }, Text);
                                    Text.pop();
                                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                                        If.create();
                                        if (chapter.pageCount > 0) {
                                            this.ifElseBranchUpdateFunction(0, () => {
                                                this.observeComponentCreation2((elmtId, isInitialRender) => {
                                                    Text.create(`${chapter.pageCount}页`);
                                                    Text.fontSize(11);
                                                    Text.fontColor('#9CA3AF');
                                                    Text.width('100%');
                                                    Text.margin({ top: 2 });
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
                                    GridItem.pop();
                                };
                                observedDeepRender();
                            }
                        };
                        this.forEachUpdateFunction(elmtId, this.chapters, forEachItemGenFunction);
                    }, ForEach);
                    ForEach.pop();
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
            Text.create('编辑信息');
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
            Text.create('画师');
            Text.fontSize(13);
            Text.fontColor('#9CA3AF');
            Text.width('100%');
            Text.margin({ top: 12, bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            TextInput.create({ text: this.editArtist, placeholder: '输入画师' });
            TextInput.width('100%');
            TextInput.height(40);
            TextInput.fontColor('#E5E7EB');
            TextInput.backgroundColor('#374151');
            TextInput.borderRadius(8);
            TextInput.onChange((value: string) => {
                this.editArtist = value;
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
            Text.create('状态');
            Text.fontSize(13);
            Text.fontColor('#9CA3AF');
            Text.width('100%');
            Text.margin({ top: 12, bottom: 4 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('未知');
            Text.fontSize(13);
            Text.fontColor(this.editStatus === 'unknown' ? '#FFFFFF' : '#9CA3AF');
            Text.backgroundColor(this.editStatus === 'unknown' ? '#6366F1' : '#374151');
            Text.borderRadius(8);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.margin({ right: 8 });
            Text.onClick(() => { this.editStatus = 'unknown'; });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('连载中');
            Text.fontSize(13);
            Text.fontColor(this.editStatus === 'ongoing' ? '#FFFFFF' : '#9CA3AF');
            Text.backgroundColor(this.editStatus === 'ongoing' ? '#6366F1' : '#374151');
            Text.borderRadius(8);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.margin({ right: 8 });
            Text.onClick(() => { this.editStatus = 'ongoing'; });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create('已完结');
            Text.fontSize(13);
            Text.fontColor(this.editStatus === 'completed' ? '#FFFFFF' : '#9CA3AF');
            Text.backgroundColor(this.editStatus === 'completed' ? '#6366F1' : '#374151');
            Text.borderRadius(8);
            Text.padding({ left: 12, right: 12, top: 6, bottom: 6 });
            Text.onClick(() => { this.editStatus = 'completed'; });
        }, Text);
        Text.pop();
        Row.pop();
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
            Button.backgroundColor('#6366F1');
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
            Image.create(ComicService.getCoverUrl(this.comicId));
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
            Button.backgroundColor('#6366F1');
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
        return "ComicDetailPage";
    }
}
registerNamedRoute(() => new ComicDetailPage(undefined, {}), "", { bundleName: "com.comicreader.harmony", moduleName: "entry", pagePath: "pages/ComicDetailPage", pageFullPath: "entry/src/main/ets/pages/ComicDetailPage", integratedHsp: "false", moduleType: "followWithHap" });
