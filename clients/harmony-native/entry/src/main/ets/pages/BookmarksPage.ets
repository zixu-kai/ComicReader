import { Comic, Book, BookmarkItem } from '../model/ComicModels'
import { ComicService, BookService, BookmarkService } from '../service/ComicService'
import { TabBar } from '../components/TabBar'
import { navigateTo, navigateToTab, NavParams } from '../common/Constants'

@Entry
@Component
struct BookmarksPage {
  @State bookmarks: BookmarkItem[] = []
  @State comics: Comic[] = []
  @State books: Book[] = []
  @State loading: boolean = true
  @State activeTab: number = 0
  @State currentTab: number = 4

  aboutToAppear(): void {
    setTimeout(() => {
      if (this.loading) {
        this.loading = false
      }
    }, 8000)
    this.loadBookmarks()
  }

  async loadBookmarks(): Promise<void> {
    try {
      const bmList: BookmarkItem[] = await BookmarkService.getBookmarks()
      this.bookmarks = bmList

      const allComicIds: number[] = []
      const allBookIds: number[] = []
      for (let i = 0; i < bmList.length; i++) {
        const b = bmList[i]
        if (b.comicIds && b.comicIds.length > 0) {
          for (let j = 0; j < b.comicIds.length; j++) {
            allComicIds.push(b.comicIds[j])
          }
        }
        if (b.bookIds && b.bookIds.length > 0) {
          for (let k = 0; k < b.bookIds.length; k++) {
            allBookIds.push(b.bookIds[k])
          }
        }
      }

      if (allComicIds.length === 0 && allBookIds.length === 0) {
        this.loading = false
        return
      }

      this.comics = []
      for (let id of allComicIds) {
        try {
          const comic: Comic = await ComicService.getComic(id)
          if (comic) {
            this.comics.push(comic)
          }
        } catch (e) {
          console.error('Failed to load comic ' + id + ': ' + JSON.stringify(e))
        }
      }

      this.books = []
      for (let id of allBookIds) {
        try {
          const book: Book = await BookService.getBook(id)
          if (book) {
            this.books.push(book)
          }
        } catch (e) {
          console.error('Failed to load book ' + id + ': ' + JSON.stringify(e))
        }
      }
    } catch (e) {
      console.error('Failed to load bookmarks: ' + JSON.stringify(e))
    } finally {
      this.loading = false
    }
  }

  onTabChange(tab: number): void {
    if (tab === 0) {
      navigateToTab(this.getUIContext(), 'pages/HomePage')
    } else if (tab === 1) {
      navigateToTab(this.getUIContext(), 'pages/LibraryPage')
    } else if (tab === 2) {
      navigateToTab(this.getUIContext(), 'pages/BookLibraryPage')
    } else if (tab === 3) {
      navigateToTab(this.getUIContext(), 'pages/CategoriesPage')
    } else if (tab === 5) {
      navigateToTab(this.getUIContext(), 'pages/RandomPage')
    } else if (tab === 6) {
      navigateToTab(this.getUIContext(), 'pages/SettingsPage')
    }
  }

  build() {
    Column() {
      Row() {
        Text('我的收藏')
          .fontSize(20)
          .fontWeight(FontWeight.Bold)
          .fontColor('#181818')
          .layoutWeight(1)
      }
      .width('100%')
      .height(56)
      .padding({ left: 20, right: 20 })
      .alignItems(VerticalAlign.Center)
      .backgroundColor('#FFFFFF')

      if (this.loading) {
        Column() {
          LoadingProgress()
            .width(36)
            .height(36)
            .color('#007DFF')
        }
        .layoutWeight(1)
        .width('100%')
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
      } else if (this.comics.length === 0 && this.books.length === 0) {
        Column() {
          Text('📌')
            .fontSize(56)
            .margin({ bottom: 16 })

          Text('还没有收藏任何内容')
            .fontSize(17)
            .fontColor('#999999')
            .fontWeight(FontWeight.Medium)

          Text('浏览漫画或图书时点击收藏按钮即可添加')
            .fontSize(14)
            .fontColor('#CCCCCC')
            .margin({ top: 8 })
        }
        .layoutWeight(1)
        .width('100%')
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
      } else {
        if (this.comics.length > 0 && this.books.length > 0) {
          Row() {
            Text('漫画')
              .fontSize(13)
              .fontColor(this.activeTab === 0 ? '#007DFF' : '#999999')
              .fontWeight(this.activeTab === 0 ? FontWeight.Medium : FontWeight.Regular)
              .border({
                width: this.activeTab === 0 ? 2 : 0,
                color: '#007DFF',
                style: BorderStyle.Solid
              })
              .borderRadius(0)
              .padding({ bottom: 8 })
              .margin({ right: 24 })
              .onClick(() => { this.activeTab = 0 })

            Text(`图书 · ${this.books.length}`)
              .fontSize(13)
              .fontColor(this.activeTab === 1 ? '#007DFF' : '#999999')
              .fontWeight(this.activeTab === 1 ? FontWeight.Medium : FontWeight.Regular)
              .border({
                width: this.activeTab === 1 ? 2 : 0,
                color: '#007DFF',
                style: BorderStyle.Solid
              })
              .borderRadius(0)
              .padding({ bottom: 8 })
              .onClick(() => { this.activeTab = 1 })
          }
          .width('100%')
          .padding({ left: 20, right: 20, top: 4, bottom: 0 })
          .border({
            width: { bottom: 0.5 },
            color: '#E5E5E5'
          })
        }

        Scroll() {
          if (this.activeTab === 0 && this.comics.length > 0) {
            this.ComicGrid()
          } else if (this.activeTab === 1 && this.books.length > 0) {
            this.BookGrid()
          }
        }
        .layoutWeight(1)
        .width('100%')
        .scrollBar(BarState.Off)
      }

      TabBar({ currentTab: $currentTab, onTabClick: (tab: number) => {
        this.onTabChange(tab)
      } })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F1F3F5')
  }

  @Builder
  ComicGrid() {
    Grid() {
      ForEach(this.comics, (comic: Comic) => {
        GridItem() {
          Column() {
            Stack() {
              if (comic.coverPath) {
                Image(ComicService.getCoverUrl(comic.id))
                  .width('100%')
                  .height(170)
                  .objectFit(ImageFit.Cover)
                  .borderRadius({ topLeft: 12, topRight: 12 })
              } else {
                Column() {
                  Text(comic.title)
                    .fontSize(14)
                    .fontColor('#FFFFFF')
                    .fontWeight(FontWeight.Medium)
                    .maxLines(3)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                    .textAlign(TextAlign.Center)
                    .padding({ left: 10, right: 10 })
                }
                .width('100%')
                .height(170)
                .linearGradient({
                  direction: GradientDirection.RightBottom,
                  colors: [['#007DFF', 0.0], ['#0052CC', 1.0]]
                })
                .borderRadius({ topLeft: 12, topRight: 12 })
                .justifyContent(FlexAlign.Center)
                .alignItems(HorizontalAlign.Center)
              }
            }
            .width('100%')
            .height(170)

            Column() {
              Text(comic.title)
                .fontSize(14)
                .fontColor('#181818')
                .fontWeight(FontWeight.Medium)
                .maxLines(2)
                .textOverflow({ overflow: TextOverflow.Ellipsis })
                .width('100%')

              if (comic.author) {
                Text(comic.author)
                  .fontSize(12)
                  .fontColor('#999999')
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                  .width('100%')
                  .margin({ top: 4 })
              }
            }
            .padding({ left: 10, right: 10, top: 10, bottom: 12 })
            .alignItems(HorizontalAlign.Start)
          }
          .width('100%')
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .shadow({
            radius: 8,
            color: '#15000000',
            offsetX: 0,
            offsetY: 2
          })
          .onClick(() => {
            let p = new NavParams(); p.comicId = comic.id; navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p)
          })
        }
        .padding(5)
      })
    }
    .columnsTemplate('1fr 1fr 1fr')
    .rowsGap(4)
    .columnsGap(4)
    .width('100%')
    .padding({ left: 12, right: 12, top: 12 })
  }

  @Builder
  BookGrid() {
    Grid() {
      ForEach(this.books, (book: Book) => {
        GridItem() {
          Column() {
            Stack() {
              if (book.coverPath) {
                Image(BookService.getCoverUrl(book.id))
                  .width('100%')
                  .height(170)
                  .objectFit(ImageFit.Cover)
                  .borderRadius({ topLeft: 12, topRight: 12 })
              } else {
                Column() {
                  Text(book.title)
                    .fontSize(14)
                    .fontColor('#FFFFFF')
                    .fontWeight(FontWeight.Medium)
                    .maxLines(3)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })
                    .textAlign(TextAlign.Center)
                    .padding({ left: 10, right: 10 })
                }
                .width('100%')
                .height(170)
                .linearGradient({
                  direction: GradientDirection.RightBottom,
                  colors: [['#007DFF', 0.0], ['#0052CC', 1.0]]
                })
                .borderRadius({ topLeft: 12, topRight: 12 })
                .justifyContent(FlexAlign.Center)
                .alignItems(HorizontalAlign.Center)
              }

              Text(book.format.toUpperCase())
                .fontSize(10)
                .fontWeight(FontWeight.Medium)
                .fontColor('#FFFFFF')
                .backgroundColor(book.format === 'pdf' ? '#FA2A2D' : book.format === 'epub' ? '#45A848' : '#F5A623')
                .borderRadius(4)
                .padding({ left: 5, right: 5, top: 2, bottom: 2 })
                .position({ x: '68%', y: 10 })
            }
            .width('100%')
            .height(170)

            Column() {
              Text(book.title)
                .fontSize(14)
                .fontColor('#181818')
                .fontWeight(FontWeight.Medium)
                .maxLines(2)
                .textOverflow({ overflow: TextOverflow.Ellipsis })
                .width('100%')

              if (book.author) {
                Text(book.author)
                  .fontSize(12)
                  .fontColor('#999999')
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                  .width('100%')
                  .margin({ top: 4 })
              }
            }
            .padding({ left: 10, right: 10, top: 10, bottom: 12 })
            .alignItems(HorizontalAlign.Start)
          }
          .width('100%')
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .shadow({
            radius: 8,
            color: '#15000000',
            offsetX: 0,
            offsetY: 2
          })
          .onClick(() => {
            let p = new NavParams(); p.bookId = book.id; navigateTo(this.getUIContext(), 'pages/BookDetailPage', p)
          })
        }
        .padding(5)
      })
    }
    .columnsTemplate('1fr 1fr 1fr')
    .rowsGap(4)
    .columnsGap(4)
    .width('100%')
    .padding({ left: 12, right: 12, top: 12 })
  }
}