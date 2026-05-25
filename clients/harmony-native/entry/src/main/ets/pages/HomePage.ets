import { ComicQueryParams, BookQueryParams } from '../model/ComicModels'
import { Comic, Book, ServerInfo, PaginatedResponse } from '../model/ComicModels'
import { ComicService, BookService, SystemService } from '../service/ComicService'
import { ComicCard } from '../components/ComicCard'
import { TabBar } from '../components/TabBar'
import { navigateTo, navigateToTab, NavParams } from '../common/Constants'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) { return bytes + ' B' }
  else if (bytes < 1024 * 1024) { return (bytes / 1024).toFixed(1) + ' KB' }
  else if (bytes < 1024 * 1024 * 1024) { return (bytes / (1024 * 1024)).toFixed(1) + ' MB' }
  else { return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB' }
}

@Entry
@Component
struct HomePage {
  @State serverInfo: ServerInfo | null = null
  @State continueReadingComics: Comic[] = []
  @State continueReadingBooks: Book[] = []
  @State recentComics: Comic[] = []
  @State randomComics: Comic[] = []
  @State randomBooks: Book[] = []
  @State currentTab: number = 0
  @State isRefreshing: boolean = false

  aboutToAppear(): void {
    this.loadAll()
  }

  async loadAll(): Promise<void> {
    this.loadServerInfo()
    this.loadContinueReadingComics()
    this.loadContinueReadingBooks()
    this.loadRecentComics()
    this.loadRandomComics()
    this.loadRandomBooks()
  }

  async loadServerInfo(): Promise<void> {
    try {
      this.serverInfo = await SystemService.getInfo()
    } catch (e) {
      console.error('Failed to load server info: ' + JSON.stringify(e))
    }
  }

  async loadContinueReadingComics(): Promise<void> {
    try {
      const comics = await ComicService.getContinueReading()
      this.continueReadingComics = comics.slice(0, 10)
    } catch (e) {
      console.error('Failed to load continue reading comics: ' + JSON.stringify(e))
    }
  }

  async loadContinueReadingBooks(): Promise<void> {
    try {
      let params = new BookQueryParams()
      params.readingStatus = 'reading'
      params.sort = 'lastReadAt'
      params.order = 'desc'
      params.pageSize = 10
      const res: PaginatedResponse<Book> = await BookService.getBooks(params)
      this.continueReadingBooks = res.data
    } catch (e) {
      console.error('Failed to load continue reading books: ' + JSON.stringify(e))
    }
  }

  async loadRecentComics(): Promise<void> {
    try {
      let params = new ComicQueryParams()
      params.sort = 'createdAt'
      params.order = 'desc'
      params.pageSize = 12
      const res: PaginatedResponse<Comic> = await ComicService.getComics(params)
      this.recentComics = res.data
    } catch (e) {
      console.error('Failed to load recent comics: ' + JSON.stringify(e))
    }
  }

  async loadRandomComics(): Promise<void> {
    try {
      this.randomComics = await ComicService.getRandomComics(6)
    } catch (e) {
      console.error('Failed to load random comics: ' + JSON.stringify(e))
    }
  }

  async loadRandomBooks(): Promise<void> {
    try {
      this.randomBooks = await BookService.getRandomBooks(3)
    } catch (e) {
      console.error('Failed to load random books: ' + JSON.stringify(e))
    }
  }

  onTabChange(tab: number): void {
    if (tab === 1) {
      navigateToTab(this.getUIContext(), 'pages/LibraryPage')
    } else if (tab === 2) {
      navigateToTab(this.getUIContext(), 'pages/BookLibraryPage')
    } else if (tab === 3) {
      navigateToTab(this.getUIContext(), 'pages/CategoriesPage')
    } else if (tab === 4) {
      navigateToTab(this.getUIContext(), 'pages/BookmarksPage')
    } else if (tab === 5) {
      navigateToTab(this.getUIContext(), 'pages/RandomPage')
    } else if (tab === 6) {
      navigateToTab(this.getUIContext(), 'pages/SettingsPage')
    }
  }

  build() {
    Column() {
      Refresh({ refreshing: $$this.isRefreshing }) {
        Scroll() {
          Column() {
            if (this.continueReadingComics.length > 0) {
              this.ContinueReadingSection()
            }

            if (this.continueReadingBooks.length > 0) {
              this.ContinueReadingBooksSection()
            }

            if (this.recentComics.length > 0) {
              this.RecentComicsSection()
            }

            if (this.randomComics.length > 0) {
              this.RandomComicsSection()
            }

            if (this.randomBooks.length > 0) {
              this.RandomBooksSection()
            }

            if (this.serverInfo) {
              this.ServerStatsSection()
            }
          }
          .width('100%')
          .padding({ bottom: 16 })
        }
        .width('100%')
        .layoutWeight(1)
        .scrollBar(BarState.Off)
      }
      .onRefreshing(async () => {
        await this.loadAll()
        this.isRefreshing = false
      })

      TabBar({ currentTab: $currentTab, onTabClick: (tab: number) => {
        this.onTabChange(tab)
      } })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F1F3F5')
  }

  @Builder
  ServerStatsSection() {
    if (this.serverInfo) {
      Column() {
        Row() {
          Text('服务器状态')
            .fontSize(18)
            .fontColor('#181818')
            .fontWeight(FontWeight.Bold)
        }
        .width('100%')
        .padding({ left: 16, right: 16, top: 16, bottom: 8 })

        Grid() {
          GridItem() {
            this.StatCard('漫画总数', `${this.serverInfo.comicCount}`)
          }

          GridItem() {
            this.StatCard('分类数', `${this.serverInfo.categoryCount}`)
          }

          GridItem() {
            this.StatCard('标签数', `${this.serverInfo.tagCount}`)
          }

          GridItem() {
            this.StatCard('总大小', formatFileSize(this.serverInfo.totalSize))
          }
        }
        .columnsTemplate('1fr 1fr')
        .rowsGap(8)
        .columnsGap(8)
        .width('100%')
        .padding({ left: 16, right: 16 })
      }
    }
  }

  @Builder
  StatCard(label: string, value: string) {
    Column() {
      Text(label)
        .fontSize(12)
        .fontColor('#999999')

      Text(value)
        .fontSize(22)
        .fontColor('#181818')
        .fontWeight(FontWeight.Bold)
        .margin({ top: 4 })
    }
    .width('100%')
    .padding(12)
    .backgroundColor('#FFFFFF')
    .borderRadius(12)
    .alignItems(HorizontalAlign.Start)
    .shadow({ radius: 8, color: '#10000000', offsetY: 2 })
  }

  @Builder
  ContinueReadingSection() {
    Column() {
      Row() {
        Text('继续阅读')
          .fontSize(18)
          .fontColor('#181818')
          .fontWeight(FontWeight.Bold)

        Blank()

        Text('查看全部')
          .fontSize(14)
          .fontColor('#007DFF')
          .onClick(() => {
            navigateToTab(this.getUIContext(), 'pages/LibraryPage')
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 16, bottom: 8 })

      Scroll() {
        Row() {
          ForEach(this.continueReadingComics, (comic: Comic) => {
            Column() {
              ComicCard({
                comic: comic,
                onTap: (c: Comic) => {
                  let p = new NavParams(); p.comicId = c.id; navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p)
                }
              })
            }
            .width(140)
            .margin({ right: 12 })
          })
        }
      }
      .scrollable(ScrollDirection.Horizontal)
      .width('100%')
      .padding({ left: 16, right: 16 })
      .scrollBar(BarState.Off)
    }
  }

  @Builder
  ContinueReadingBooksSection() {
    Column() {
      Row() {
        Text('继续阅读 - 图书')
          .fontSize(18)
          .fontColor('#181818')
          .fontWeight(FontWeight.Bold)

        Blank()

        Text('查看全部')
          .fontSize(14)
          .fontColor('#007DFF')
          .onClick(() => {
            navigateToTab(this.getUIContext(), 'pages/BookLibraryPage')
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 16, bottom: 8 })

      Column() {
        ForEach(this.continueReadingBooks, (book: Book) => {
          this.BookListItem(book)
        })
      }
      .width('100%')
      .padding({ left: 16, right: 16 })
    }
  }

  @Builder
  RecentComicsSection() {
    Column() {
      Row() {
        Text('最近添加')
          .fontSize(18)
          .fontColor('#181818')
          .fontWeight(FontWeight.Bold)

        Blank()

        Text('查看全部')
          .fontSize(14)
          .fontColor('#007DFF')
          .onClick(() => {
            navigateToTab(this.getUIContext(), 'pages/LibraryPage')
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 16, bottom: 8 })

      Grid() {
        ForEach(this.recentComics, (comic: Comic) => {
          GridItem() {
            ComicCard({
              comic: comic,
              onTap: (c: Comic) => {
                let p = new NavParams(); p.comicId = c.id; navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p)
              }
            })
          }
          .padding(4)
        })
      }
      .columnsTemplate('1fr 1fr 1fr')
      .rowsGap(8)
      .columnsGap(8)
      .width('100%')
      .padding({ left: 12, right: 12 })
    }
  }

  @Builder
  RandomComicsSection() {
    Column() {
      Row() {
        Text('随机推荐')
          .fontSize(18)
          .fontColor('#181818')
          .fontWeight(FontWeight.Bold)

        Blank()

        Text('换一批')
          .fontSize(14)
          .fontColor('#007DFF')
          .onClick(() => {
            this.loadRandomComics()
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 16, bottom: 8 })

      Grid() {
        ForEach(this.randomComics, (comic: Comic) => {
          GridItem() {
            ComicCard({
              comic: comic,
              onTap: (c: Comic) => {
                let p = new NavParams(); p.comicId = c.id; navigateTo(this.getUIContext(), 'pages/ComicDetailPage', p)
              }
            })
          }
          .padding(4)
        })
      }
      .columnsTemplate('1fr 1fr 1fr')
      .rowsGap(8)
      .columnsGap(8)
      .width('100%')
      .padding({ left: 12, right: 12 })
    }
  }

  @Builder
  RandomBooksSection() {
    Column() {
      Row() {
        Text('随机图书推荐')
          .fontSize(18)
          .fontColor('#181818')
          .fontWeight(FontWeight.Bold)

        Blank()

        Text('查看全部')
          .fontSize(14)
          .fontColor('#007DFF')
          .onClick(() => {
            navigateToTab(this.getUIContext(), 'pages/BookLibraryPage')
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 16, bottom: 8 })

      Column() {
        ForEach(this.randomBooks, (book: Book) => {
          this.BookListItem(book)
        })
      }
      .width('100%')
      .padding({ left: 16, right: 16 })
    }
  }

  @Builder
  BookListItem(book: Book) {
    Row() {
      if (book.coverPath) {
        Image(BookService.getCoverUrl(book.id))
          .width(56)
          .height(76)
          .objectFit(ImageFit.Cover)
          .borderRadius(6)
      } else {
        Column() {
          Text(book.title)
            .fontSize(11)
            .fontColor('#FFFFFF')
            .maxLines(2)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .textAlign(TextAlign.Center)
        }
        .width(56)
        .height(76)
        .linearGradient({
          direction: GradientDirection.RightBottom,
          colors: [['#007DFF', 0.0], ['#0052CC', 1.0]]
        })
        .borderRadius(6)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
        .padding(4)
      }

      Column() {
        Text(book.title)
          .fontSize(14)
          .fontColor('#181818')
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })

        Text(book.author || '未知作者')
          .fontSize(12)
          .fontColor('#999999')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .margin({ top: 4 })

        Row() {
          Text(book.format.toUpperCase())
            .fontSize(10)
            .fontColor('#FFFFFF')
            .backgroundColor(book.format === 'pdf' ? '#FA2A2D' : book.format === 'epub' ? '#45A848' : '#F5A623')
            .borderRadius(4)
            .padding({ left: 4, right: 4, top: 2, bottom: 2 })

          if (book.readingProgress) {
            Text(`${Math.round(book.readingProgress.percentage * 100)}%`)
              .fontSize(11)
              .fontColor('#999999')
              .margin({ left: 8 })
          }
        }
        .margin({ top: 4 })
      }
      .layoutWeight(1)
      .padding({ left: 12 })
      .alignItems(HorizontalAlign.Start)
    }
    .width('100%')
    .backgroundColor('#FFFFFF')
    .borderRadius(12)
    .padding(8)
    .margin({ bottom: 8 })
    .shadow({ radius: 8, color: '#10000000', offsetY: 2 })
    .onClick(() => {
      let p = new NavParams(); p.bookId = book.id; navigateTo(this.getUIContext(), 'pages/BookDetailPage', p)
    })
  }
}