import { ComicService } from '../service/ComicService'
import { Chapter, ChapterPagesResult } from '../model/ComicModels'
import { router } from '@kit.ArkUI'
import { navigateTo } from '../common/Constants'

@Entry
@Component
struct ComicReaderPage {
  @State comicId: number = 0
  @State chapterId: number = 0
  @State chapters: Chapter[] = []
  @State currentPage: number = 1
  @State totalPages: number = 0
  @State showControls: boolean = true
  @State readingMode: number = 0
  @State scaleValue: number = 100
  @State isLoading: boolean = true
  @State comicTitle: string = ''
  private hideTimer: number = -1
  private swiperController: SwiperController = new SwiperController()

  aboutToAppear(): void {
    const params = this.getUIContext().getRouter().getParams() as Record<string, number>
    if (params) {
      this.comicId = params.comicId ?? 0
      this.chapterId = params.chapterId ?? 0
    }
    this.loadData()
  }

  aboutToDisappear(): void {
    if (this.hideTimer !== -1) {
      clearTimeout(this.hideTimer)
    }
  }

  async loadData(): Promise<void> {
    try {
      this.isLoading = true
      if (this.chapterId === 0) {
        this.chapters = await ComicService.getChapters(this.comicId)
        if (this.chapters.length > 0) {
          this.chapterId = this.chapters[0].id
        }
      } else {
        this.chapters = await ComicService.getChapters(this.comicId)
      }
      if (this.chapterId > 0) {
        const result: ChapterPagesResult = await ComicService.getChapterPages(this.chapterId)
        this.totalPages = result.pages
      }
      this.isLoading = false
    } catch (e) {
      console.error('Failed to load chapter data: ' + JSON.stringify(e))
      this.isLoading = false
    }
  }

  resetHideTimer(): void {
    if (this.hideTimer !== -1) {
      clearTimeout(this.hideTimer)
    }
    this.hideTimer = setTimeout(() => {
      this.showControls = false
    }, 3000)
  }

  toggleControls(): void {
    this.showControls = !this.showControls
    if (this.showControls) {
      this.resetHideTimer()
    }
  }

  async saveProgress(): Promise<void> {
    try {
      await ComicService.updateProgress(this.comicId, this.chapterId, this.currentPage, this.totalPages)
    } catch (e) {
      console.error('Failed to save progress: ' + JSON.stringify(e))
    }
  }

  goToPage(page: number): void {
    if (page < 1) page = 1
    if (page > this.totalPages) page = this.totalPages
    this.currentPage = page
    this.saveProgress()
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++
      this.saveProgress()
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--
      this.saveProgress()
    }
  }

  async switchChapter(chapterId: number): Promise<void> {
    this.chapterId = chapterId
    this.currentPage = 1
    try {
      const result: ChapterPagesResult = await ComicService.getChapterPages(this.chapterId)
      this.totalPages = result.pages
    } catch (e) {
      console.error('Failed to load chapter: ' + JSON.stringify(e))
    }
  }

  prevChapter(): void {
    const idx = this.chapters.findIndex((c: Chapter) => c.id === this.chapterId)
    if (idx > 0) {
      this.switchChapter(this.chapters[idx - 1].id)
    }
  }

  nextChapter(): void {
    const idx = this.chapters.findIndex((c: Chapter) => c.id === this.chapterId)
    if (idx < this.chapters.length - 1) {
      this.switchChapter(this.chapters[idx + 1].id)
    }
  }

  @Builder
  SinglePageMode() {
    Stack() {
      Image(ComicService.getPageImageUrl(this.chapterId, this.currentPage))
        .width(`${this.scaleValue}%`)
        .objectFit(ImageFit.Contain)
        .onClick(() => this.toggleControls())

      Row() {
        Column()
          .width('30%')
          .height('100%')
          .onClick(() => this.prevPage())

        Column()
          .width('40%')
          .height('100%')
          .onClick(() => this.toggleControls())

        Column()
          .width('30%')
          .height('100%')
          .onClick(() => this.nextPage())
      }
      .width('100%')
      .height('100%')
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  DoublePageMode() {
    Row() {
      if (this.currentPage > 1) {
        Image(ComicService.getPageImageUrl(this.chapterId, this.currentPage - 1))
          .width('50%')
          .height('100%')
          .objectFit(ImageFit.Contain)
      }
      Image(ComicService.getPageImageUrl(this.chapterId, this.currentPage))
        .width('50%')
        .height('100%')
        .objectFit(ImageFit.Contain)
    }
    .width('100%')
    .height('100%')
    .onClick(() => this.toggleControls())
    .gesture(
      PanGesture()
        .onActionEnd((e: GestureEvent) => {
          if (e.offsetX < -50) this.nextPage()
          else if (e.offsetX > 50) this.prevPage()
        })
    )
  }

  @Builder
  ScrollMode() {
    Scroll() {
      Column() {
        ForEach(Array.from({ length: this.totalPages }, (_v: Object, i: number) => i + 1), (pageNum: number) => {
          Image(ComicService.getPageImageUrl(this.chapterId, pageNum))
            .width('100%')
            .objectFit(ImageFit.Auto)
        })
      }
    }
    .width('100%')
    .height('100%')
    .scrollable(ScrollDirection.Vertical)
  }

  @Builder
  SlideMode() {
    Swiper(this.swiperController) {
      ForEach(Array.from({ length: this.totalPages }, (_v: Object, i: number) => i + 1), (pageNum: number) => {
        Image(ComicService.getPageImageUrl(this.chapterId, pageNum))
          .width('100%')
          .height('100%')
          .objectFit(ImageFit.Contain)
      })
    }
    .index(this.currentPage - 1)
    .indicator(false)
    .loop(false)
    .onChange((index: number) => {
      this.currentPage = index + 1
      this.saveProgress()
    })
  }

  build() {
    Stack() {
      Column() {
        if (this.isLoading) {
          Column() {
            LoadingProgress()
              .width(48)
              .height(48)
              .color('#6366F1')
            Text('加载中...')
              .fontSize(14)
              .fontColor('#9CA3AF')
              .margin({ top: 12 })
          }
          .width('100%')
          .height('100%')
          .justifyContent(FlexAlign.Center)
          .alignItems(HorizontalAlign.Center)
        } else {
          if (this.readingMode === 0) {
            this.SinglePageMode()
          } else if (this.readingMode === 1) {
            this.DoublePageMode()
          } else if (this.readingMode === 2) {
            this.SlideMode()
          } else {
            this.ScrollMode()
          }
        }
      }
      .width('100%')
      .height('100%')
      .backgroundColor('#000000')

      if (this.showControls) {
        Column() {
          Row() {
            Image($r('sys.media.ohos_ic_public_arrow_left'))
              .width(24)
              .height(24)
              .fillColor('#FFFFFF')
              .onClick(() => { try { this.getUIContext().getRouter().back() } catch (e) { console.error('Back failed: ' + JSON.stringify(e)) } })

            Text(this.comicTitle)
              .fontSize(16)
              .fontColor('#FFFFFF')
              .layoutWeight(1)
              .maxLines(1)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
              .margin({ left: 12 })

            Text(`${this.currentPage}/${this.totalPages}`)
              .fontSize(14)
              .fontColor('#9CA3AF')
          }
          .width('100%')
          .height(56)
          .padding({ left: 16, right: 16 })
          .alignItems(VerticalAlign.Center)
          .backgroundColor('#CC000000')

          Column()
            .layoutWeight(1)

          Column() {
            Row() {
              Text('单页')
                .fontSize(12)
                .fontColor(this.readingMode === 0 ? '#6366F1' : '#9CA3AF')
                .backgroundColor(this.readingMode === 0 ? '#312E81' : '#1F2937')
                .borderRadius(12)
                .padding({ left: 10, right: 10, top: 6, bottom: 6 })
                .onClick(() => { this.readingMode = 0 })

              Text('双页')
                .fontSize(12)
                .fontColor(this.readingMode === 1 ? '#6366F1' : '#9CA3AF')
                .backgroundColor(this.readingMode === 1 ? '#312E81' : '#1F2937')
                .borderRadius(12)
                .padding({ left: 10, right: 10, top: 6, bottom: 6 })
                .margin({ left: 8 })
                .onClick(() => { this.readingMode = 1 })

              Text('滑动')
                .fontSize(12)
                .fontColor(this.readingMode === 2 ? '#6366F1' : '#9CA3AF')
                .backgroundColor(this.readingMode === 2 ? '#312E81' : '#1F2937')
                .borderRadius(12)
                .padding({ left: 10, right: 10, top: 6, bottom: 6 })
                .margin({ left: 8 })
                .onClick(() => { this.readingMode = 2 })

              Text('滚动')
                .fontSize(12)
                .fontColor(this.readingMode === 3 ? '#6366F1' : '#9CA3AF')
                .backgroundColor(this.readingMode === 3 ? '#312E81' : '#1F2937')
                .borderRadius(12)
                .padding({ left: 10, right: 10, top: 6, bottom: 6 })
                .margin({ left: 8 })
                .onClick(() => { this.readingMode = 3 })
            }
            .width('100%')
            .justifyContent(FlexAlign.Center)
            .margin({ bottom: 12 })

            Row() {
              Text('-')
                .fontSize(18)
                .fontColor('#FFFFFF')
                .width(36)
                .height(36)
                .textAlign(TextAlign.Center)
                .borderRadius(18)
                .backgroundColor('#1F2937')
                .onClick(() => {
                  if (this.scaleValue > 50) this.scaleValue -= 10
                })

              Slider({
                value: this.scaleValue,
                min: 50,
                max: 300,
                step: 10,
                style: SliderStyle.InSet
              })
                .width('50%')
                .trackColor('#1F2937')
                .selectedColor('#6366F1')
                .onChange((value: number) => {
                  this.scaleValue = value
                })

              Text('+')
                .fontSize(18)
                .fontColor('#FFFFFF')
                .width(36)
                .height(36)
                .textAlign(TextAlign.Center)
                .borderRadius(18)
                .backgroundColor('#1F2937')
                .onClick(() => {
                  if (this.scaleValue < 300) this.scaleValue += 10
                })

              Text(`${this.scaleValue}%`)
                .fontSize(12)
                .fontColor('#9CA3AF')
                .width(40)
                .textAlign(TextAlign.Center)
            }
            .width('100%')
            .justifyContent(FlexAlign.Center)
            .alignItems(VerticalAlign.Center)
            .margin({ bottom: 12 })

            Row() {
              Button('上一话')
                .fontSize(12)
                .fontColor('#FFFFFF')
                .backgroundColor('#1F2937')
                .borderRadius(16)
                .height(32)
                .enabled(this.chapters.findIndex((c: Chapter) => c.id === this.chapterId) > 0)
                .onClick(() => this.prevChapter())

              Slider({
                value: this.currentPage,
                min: 1,
                max: Math.max(this.totalPages, 1),
                step: 1,
                style: SliderStyle.InSet
              })
                .layoutWeight(1)
                .trackColor('#1F2937')
                .selectedColor('#6366F1')
                .onChange((value: number) => {
                  this.goToPage(Math.round(value))
                })

              Button('下一话')
                .fontSize(12)
                .fontColor('#FFFFFF')
                .backgroundColor('#1F2937')
                .borderRadius(16)
                .height(32)
                .enabled(this.chapters.findIndex((c: Chapter) => c.id === this.chapterId) < this.chapters.length - 1)
                .onClick(() => this.nextChapter())
            }
            .width('100%')
            .padding({ left: 16, right: 16 })
            .alignItems(VerticalAlign.Center)
          }
          .width('100%')
          .padding({ top: 12, bottom: 24 })
          .backgroundColor('#CC000000')
        }
        .width('100%')
        .height('100%')
      }
    }
    .width('100%')
    .height('100%')
  }
}
