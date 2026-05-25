import { Comic, Book, SelectItem } from '../model/ComicModels'
import { ComicService, BookService } from '../service/ComicService'
import { navigateTo, NavParams, navigateToTab } from '../common/Constants'

@Entry
@Component
struct RandomPage {
  @State randomType: number = 0
  @State resultComic: Comic | null = null
  @State resultBook: Book | null = null
  @State resultType: string = ''
  @State isLoading: boolean = false
  @State typeOptions: SelectItem[] = []

  aboutToAppear(): void {
    const opts: SelectItem[] = []
    let opt1 = new SelectItem(); opt1.key = 0; opt1.label = '全部'; opts.push(opt1)
    let opt2 = new SelectItem(); opt2.key = 1; opt2.label = '仅漫画'; opts.push(opt2)
    let opt3 = new SelectItem(); opt3.key = 2; opt3.label = '仅图书'; opts.push(opt3)
    this.typeOptions = opts
  }

  async fetchRandom(): Promise<void> {
    this.isLoading = true
    this.resultComic = null
    this.resultBook = null
    this.resultType = ''

    try {
      if (this.randomType === 0) {
        const useComic = Math.random() < 0.5
        if (useComic) {
          const comics: Comic[] = await ComicService.getRandomComics(1)
          if (comics.length > 0) {
            this.resultComic = comics[0]
            this.resultType = 'comic'
          }
        } else {
          const books: Book[] = await BookService.getRandomBooks(1)
          if (books.length > 0) {
            this.resultBook = books[0]
            this.resultType = 'book'
          }
        }
      } else if (this.randomType === 1) {
        const comics: Comic[] = await ComicService.getRandomComics(1)
        if (comics.length > 0) {
          this.resultComic = comics[0]
          this.resultType = 'comic'
        }
      } else {
        const books: Book[] = await BookService.getRandomBooks(1)
        if (books.length > 0) {
          this.resultBook = books[0]
          this.resultType = 'book'
        }
      }
    } catch (e) {
      console.error('Failed to fetch random: ' + JSON.stringify(e))
    } finally {
      this.isLoading = false
    }
  }

  build() {
    Column() {
      Row() {
        Image($r('sys.media.ohos_ic_public_arrow_left'))
          .width(24)
          .height(24)
          .fillColor('#181818')
          .onClick(() => {
            try { navigateToTab(this.getUIContext(), 'pages/HomePage') } catch (e) { console.error('Back failed: ' + JSON.stringify(e)) }
          })

        Text('随机发现')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#181818')
          .layoutWeight(1)
          .textAlign(TextAlign.Center)

        Row()
          .width(24)
          .height(24)
      }
      .width('100%')
      .height(56)
      .padding({ left: 16, right: 16 })
      .alignItems(VerticalAlign.Center)
      .backgroundColor('#FFFFFF')

      Column() {
        Column() {
          Text('随机类型')
            .fontSize(14)
            .fontColor('#999999')
            .width('100%')
            .margin({ bottom: 12 })

          Row() {
            ForEach(this.typeOptions, (item: SelectItem) => {
              Text(item.label)
                .fontSize(14)
                .fontColor(this.randomType === item.key ? '#FFFFFF' : '#999999')
                .backgroundColor(this.randomType === item.key ? '#007DFF' : '#F5F5F5')
                .borderRadius(16)
                .padding({ left: 16, right: 16, top: 8, bottom: 8 })
                .margin({ right: 8 })
                .onClick(() => {
                  this.randomType = item.key
                })
            })
          }
        }
        .width('100%')
        .backgroundColor('#FFFFFF')
        .shadow({ radius: 6, color: '#10000000', offsetY: 1 })
        .borderRadius(12)
        .padding(16)
        .margin({ top: 16, left: 16, right: 16 })

        Button(this.isLoading ? '抽取中...' : '🎲 随机推荐')
          .width('100%')
          .height(52)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#FFFFFF')
          .backgroundColor('#007DFF')
          .borderRadius(26)
          .margin({ top: 20, left: 16, right: 16 })
          .enabled(!this.isLoading)
          .onClick(() => {
            this.fetchRandom()
          })

        if (this.resultType === 'comic' && this.resultComic) {
          this.ComicResultCard()
        }

        if (this.resultType === 'book' && this.resultBook) {
          this.BookResultCard()
        }

        if (!this.resultType && !this.isLoading) {
          Column() {
            Text('点击上方按钮，随机发现一本好书或漫画')
              .fontSize(14)
              .fontColor('#CCCCCC')
              .textAlign(TextAlign.Center)
          }
          .width('100%')
          .layoutWeight(1)
          .justifyContent(FlexAlign.Center)
          .alignItems(HorizontalAlign.Center)
        }
      }
      .layoutWeight(1)
      .width('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F1F3F5')
  }

  @Builder
  ComicResultCard() {
    Column() {
      Row() {
        if (this.resultComic!.coverPath) {
          Image(ComicService.getCoverUrl(this.resultComic!.id))
            .width(100)
            .height(140)
            .objectFit(ImageFit.Cover)
            .borderRadius(8)
        } else {
          Column() {
            Text(this.resultComic!.title)
              .fontSize(12)
              .fontColor('#FFFFFF')
              .maxLines(3)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
              .textAlign(TextAlign.Center)
              .padding({ left: 4, right: 4 })
          }
          .width(100)
          .height(140)
          .linearGradient({
            direction: GradientDirection.RightBottom,
            colors: [['#007DFF', 0.0], ['#0052CC', 1.0]]
          })
          .borderRadius(8)
          .justifyContent(FlexAlign.Center)
          .alignItems(HorizontalAlign.Center)
        }

        Column() {
          Text(this.resultComic!.title)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor('#181818')
            .maxLines(2)
            .textOverflow({ overflow: TextOverflow.Ellipsis })

          if (this.resultComic!.author) {
            Text(`作者: ${this.resultComic!.author}`)
              .fontSize(13)
              .fontColor('#999999')
              .margin({ top: 6 })
          }

          Text(`${this.resultComic!.pageCount} 页`)
            .fontSize(13)
            .fontColor('#999999')
            .margin({ top: 4 })

          Text('漫画')
            .fontSize(12)
            .fontColor('#007DFF')
            .backgroundColor('#EBF1FF')
            .borderRadius(8)
            .padding({ left: 8, right: 8, top: 2, bottom: 2 })
            .margin({ top: 8 })
        }
        .layoutWeight(1)
        .margin({ left: 12 })
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .alignItems(VerticalAlign.Top)
    }
    .width('100%')
    .backgroundColor('#FFFFFF')
    .shadow({ radius: 6, color: '#10000000', offsetY: 1 })
    .borderRadius(12)
    .padding(16)
    .margin({ top: 20, left: 16, right: 16 })
    .onClick(() => {
      let p = new NavParams(); p.comicId = this.resultComic!.id; navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p)
    })
  }

  @Builder
  BookResultCard() {
    Column() {
      Row() {
        if (this.resultBook!.coverPath) {
          Image(BookService.getCoverUrl(this.resultBook!.id))
            .width(100)
            .height(140)
            .objectFit(ImageFit.Cover)
            .borderRadius(8)
        } else {
          Column() {
            Text(this.resultBook!.title)
              .fontSize(12)
              .fontColor('#FFFFFF')
              .maxLines(3)
              .textOverflow({ overflow: TextOverflow.Ellipsis })
              .textAlign(TextAlign.Center)
              .padding({ left: 4, right: 4 })
          }
          .width(100)
          .height(140)
          .linearGradient({
            direction: GradientDirection.RightBottom,
            colors: [['#007DFF', 0.0], ['#0052CC', 1.0]]
          })
          .borderRadius(8)
          .justifyContent(FlexAlign.Center)
          .alignItems(HorizontalAlign.Center)
        }

        Column() {
          Text(this.resultBook!.title)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor('#181818')
            .maxLines(2)
            .textOverflow({ overflow: TextOverflow.Ellipsis })

          if (this.resultBook!.author) {
            Text(`作者: ${this.resultBook!.author}`)
              .fontSize(13)
              .fontColor('#999999')
              .margin({ top: 6 })
          }

          Text(this.resultBook!.format.toUpperCase())
            .fontSize(13)
            .fontColor('#999999')
            .margin({ top: 4 })

          Text('图书')
            .fontSize(12)
            .fontColor('#007DFF')
            .backgroundColor('#EBF1FF')
            .borderRadius(8)
            .padding({ left: 8, right: 8, top: 2, bottom: 2 })
            .margin({ top: 8 })
        }
        .layoutWeight(1)
        .margin({ left: 12 })
        .alignItems(HorizontalAlign.Start)
      }
      .width('100%')
      .alignItems(VerticalAlign.Top)
    }
    .width('100%')
    .backgroundColor('#FFFFFF')
    .shadow({ radius: 6, color: '#10000000', offsetY: 1 })
    .borderRadius(12)
    .padding(16)
    .margin({ top: 20, left: 16, right: 16 })
    .onClick(() => {
      let p = new NavParams(); p.bookId = this.resultBook!.id; navigateTo(this.getUIContext(), 'pages/BookDetailPage', p)
    })
  }
}