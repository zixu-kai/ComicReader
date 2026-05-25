if (!("finalizeConstruction" in ViewPU.prototype)) {
    Reflect.set(ViewPU.prototype, "finalizeConstruction", () => { });
}
interface ComicCard_Params {
    comic?: Comic;
    onTap?: (comic: Comic) => void;
}
import type { Comic } from '../model/ComicModels';
import { ComicService } from "@bundle:com.comicreader.harmony/entry/ets/service/ComicService";
export class ComicCard extends ViewPU {
    constructor(parent, params, __localStorage, elmtId = -1, paramsLambda = undefined, extraInfo) {
        super(parent, __localStorage, elmtId, extraInfo);
        if (typeof paramsLambda === "function") {
            this.paramsGenerator_ = paramsLambda;
        }
        this.__comic = new SynchedPropertyObjectOneWayPU(params.comic, this, "comic");
        this.onTap = (_c: Comic) => { };
        this.setInitiallyProvidedValue(params);
        this.finalizeConstruction();
    }
    setInitiallyProvidedValue(params: ComicCard_Params) {
        if (params.onTap !== undefined) {
            this.onTap = params.onTap;
        }
    }
    updateStateVars(params: ComicCard_Params) {
        this.__comic.reset(params.comic);
    }
    purgeVariableDependenciesOnElmtId(rmElmtId) {
        this.__comic.purgeDependencyOnElmtId(rmElmtId);
    }
    aboutToBeDeleted() {
        this.__comic.aboutToBeDeleted();
        SubscriberManager.Get().delete(this.id__());
        this.aboutToBeDeletedInternal();
    }
    private __comic: SynchedPropertySimpleOneWayPU<Comic>;
    get comic() {
        return this.__comic.get();
    }
    set comic(newValue: Comic) {
        this.__comic.set(newValue);
    }
    private onTap: (comic: Comic) => void;
    initialRender() {
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.width('100%');
            Column.backgroundColor('#FFFFFF');
            Column.borderRadius(12);
            Column.shadow({
                radius: 8,
                color: '#10000000',
                offsetX: 0,
                offsetY: 2
            });
            Column.onClick(() => this.onTap(ObservedObject.GetRawObject(this.comic)));
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Stack.create();
            Stack.width('100%');
            Stack.height(170);
        }, Stack);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.comic.coverPath) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Image.create(ComicService.getCoverUrl(this.comic.id));
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
                        Text.create(this.comic.title);
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
            Text.create(this.comic.fileType.toUpperCase());
            Text.fontSize(10);
            Text.fontWeight(FontWeight.Medium);
            Text.fontColor('#FFFFFF');
            Text.backgroundColor('#007DFF');
            Text.borderRadius(4);
            Text.padding({ left: 5, right: 5, top: 2, bottom: 2 });
            Text.position({ x: '68%', y: 8 });
        }, Text);
        Text.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.comic.readingProgress && !this.comic.readingProgress.isCompleted) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Progress.create({ value: this.comic.readingProgress.currentPage, total: this.comic.readingProgress.totalPages });
                        Progress.width('100%');
                        Progress.height(3);
                        Progress.color('#007DFF');
                        Progress.backgroundColor('#E5E5E5');
                        Progress.position({ x: 0, y: 167 });
                    }, Progress);
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
            if (this.comic.readingProgress && this.comic.readingProgress.isCompleted) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('已完成');
                        Text.fontSize(10);
                        Text.fontColor('#FFFFFF');
                        Text.backgroundColor('#45A848');
                        Text.borderRadius(4);
                        Text.padding({ left: 5, right: 5, top: 2, bottom: 2 });
                        Text.position({ x: '62%', y: 8 });
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
        Stack.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Column.create();
            Column.padding({ left: 10, right: 10, top: 10, bottom: 12 });
            Column.alignItems(HorizontalAlign.Start);
        }, Column);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Text.create(this.comic.title);
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
            if (this.comic.author) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.comic.author);
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
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            Row.create();
            Row.width('100%');
            Row.justifyContent(FlexAlign.SpaceBetween);
            Row.margin({ top: 4 });
        }, Row);
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.comic.rating && this.comic.rating.score > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Row.create();
                    }, Row);
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('★');
                        Text.fontSize(12);
                        Text.fontColor('#F5A623');
                    }, Text);
                    Text.pop();
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(this.comic.rating.score.toString());
                        Text.fontSize(11);
                        Text.fontColor('#999999');
                        Text.margin({ left: 2 });
                    }, Text);
                    Text.pop();
                    Row.pop();
                });
            }
            else {
                this.ifElseBranchUpdateFunction(1, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create('未评分');
                        Text.fontSize(11);
                        Text.fontColor('#CCCCCC');
                    }, Text);
                    Text.pop();
                });
            }
        }, If);
        If.pop();
        this.observeComponentCreation2((elmtId, isInitialRender) => {
            If.create();
            if (this.comic.pageCount > 0) {
                this.ifElseBranchUpdateFunction(0, () => {
                    this.observeComponentCreation2((elmtId, isInitialRender) => {
                        Text.create(`${this.comic.pageCount}页`);
                        Text.fontSize(11);
                        Text.fontColor('#CCCCCC');
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
        Column.pop();
    }
    rerender() {
        this.updateDirtyElements();
    }
}
