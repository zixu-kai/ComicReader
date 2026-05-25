import { Book, BookQueryParams, PaginatedResponse, Tag } from '../model/ComicModels'
import { BookService, TagService } from '../service/ComicService'
import { TabBar } from '../components/TabBar'
import { Constants, navigateTo, navigateToTab, NavParams } from '../common/Constants'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) { return bytes + ' B' }
  else if (bytes < 1024 * 1024) { return (bytes / 1024).toFixed(1) + ' KB' }
  else if (bytes < 1024 * 1024 * 1024) { return (bytes / (1024 * 1024)).toFixed(1) + ' MB' }
  else { return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB' }
}

@Entry
@Component
struct BookLibraryPage {
  @State books: Book[] = []
  @State tags: Tag[] = []
  @State currentTab: number = 2
  @State searchQuery: string = ''
  @State selectedTagId: number = 0
  @State selectedFormat: string = ''
  @State sortField: string = 'createdAt'
  @State sortOrder: string = 'desc'
  @State currentPage: number = 1
  @State totalPages: number = 1
  @State totalBooks: number = 0
  @State isRefreshing: boolean = false
  @State isLoadingMore: boolean = false
  @State showFilter: boolean = false

  aboutToAppear(): void {
    this.loadBooks(true)
    this.loadTags()
  }

  onTabChange(tab: number): void {
    if (tab === 0) {
      navigateToTab(this.getUIContext(), 'pages/HomePage')
    } else if (tab === 1) {
      navigateToTab(this.getUIContext(), 'pages/LibraryPage')
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

  async loadBooks(reset: boolean): Promise<void> {
    if (reset) {
      this.currentPage = 1
    }
    try {
      let params = new BookQueryParams()
      params.page = this.currentPage
      params.pageSize = Constants.PAGE_SIZE
      params.sort = this.sortField
      params.order = this.sortOrder
      if (this.searchQuery) {
        params.query = this.searchQuery
      }
      if (this.selectedTagId > 0) {
        params.tagId = this.selectedTagId
      }
      if (this.selectedFormat) {
        params.format = this.selectedFormat
      }
      const res: PaginatedResponse<Book> = await BookService.getBooks(params)
      if (reset) {
        this.books = res.data
      } else {
        this.books = this.books.concat(res.data)
      }
      this.totalPages = res.totalPages
      this.totalBooks = res.total
    } catch (e) {
      console.error('Failed to load books: ' + JSON.stringify(e))
    }
  }

  async loadTags(): Promise<void> {
    try {
      this.tags = await TagService.getTags()
    } catch (e) {
      console.error('Failed to load tags: ' + JSON.stringify(e))
    }
  }

  build() {
    Column() {
      this.BookLibraryContent()

      TabBar({ currentTab: $currentTab, onTabClick: (tab: number) => {
        this.onTabChange(tab)
      } })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F1F3F5')
  }

  @Builder
  BookLibraryContent() {
    Column() {
      Row() {
        Search({ value: this.searchQuery, placeholder: '搜索图书' })
          .layoutWeight(1)
          .height(40)
          .backgroundColor('#FFFFFF')
          .fontColor('#181818')
          .borderRadius(20)
          .onChange((value: string) => {
            this.searchQuery = value
          })
          .onSubmit(() => {
            this.loadBooks(true)
          })

        Text(this.showFilter ? '收起' : '筛选')
          .fontSize(13)
          .fontColor('#007DFF')
          .margin({ left: 12 })
          .onClick(() => {
            this.showFilter = !this.showFilter
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 8, bottom: 8 })

      if (this.showFilter) {
        this.FilterPanel()
      }

      if (this.tags.length > 0) {
        Scroll() {
          Row() {
            Text('全部')
              .fontSize(13)
              .fontColor(this.selectedTagId === 0 ? '#007DFF' : '#999999')
              .backgroundColor(this.selectedTagId === 0 ? '#EBF1FF' : '#F5F5F5')
              .borderRadius(16)
              .padding({ left: 12, right: 12, top: 6, bottom: 6 })
              .margin({ right: 8 })
              .onClick(() => {
                this.selectedTagId = 0
                this.loadBooks(true)
              })

            ForEach(this.tags, (tag: Tag) => {
              Text(tag.name)
                .fontSize(13)
                .fontColor(this.selectedTagId === tag.id ? '#007DFF' : '#999999')
                .backgroundColor(this.selectedTagId === tag.id ? '#EBF1FF' : '#F5F5F5')
                .borderRadius(16)
                .padding({ left: 12, right: 12, top: 6, bottom: 6 })
                .margin({ right: 8 })
                .onClick(() => {
                  this.selectedTagId = tag.id
                  this.loadBooks(true)
                })
            })
          }
        }
        .scrollable(ScrollDirection.Horizontal)
        .width('100%')
        .padding({ left: 16, right: 16, bottom: 8 })
      }

      Row() {
        Text(`共 ${this.totalBooks} 本`)
          .fontSize(12)
          .fontColor('#999999')

        Row() {
          Text('排序:')
            .fontSize(12)
            .fontColor('#999999')
            .margin({ right: 4 })

          Text(this.sortField === 'createdAt' ? '添加时间' : this.sortField === 'updatedAt' ? '更新时间' : this.sortField === 'title' ? '标题' : this.sortField === 'lastReadAt' ? '最近阅读' : '评分')
            .fontSize(12)
            .fontColor('#007DFF')
            .onClick(() => {
              const fields: string[] = ['createdAt', 'updatedAt', 'title', 'lastReadAt', 'rating']
              const idx = fields.indexOf(this.sortField)
              this.sortField = fields[(idx + 1) % fields.length]
              this.loadBooks(true)
            })

          Text(this.sortOrder === 'desc' ? '↓' : '↑')
            .fontSize(12)
            .fontColor('#007DFF')
            .margin({ left: 4 })
            .onClick(() => {
              this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
              this.loadBooks(true)
            })
        }
        .margin({ left: 'auto' })
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 8 })

      Refresh({ refreshing: $$this.isRefreshing }) {
        Grid() {
          ForEach(this.books, (book: Book) => {
            GridItem() {
              this.BookCard(book)
            }
            .padding(4)
          })
        }
        .columnsTemplate('1fr 1fr 1fr')
        .rowsGap(8)
        .columnsGap(8)
        .width('100%')
        .layoutWeight(1)
        .padding({ left: 12, right: 12 })
      }
      .onRefreshing(async () => {
        await this.loadBooks(true)
        this.isRefreshing = false
      })

      if (this.currentPage < this.totalPages) {
        Row() {
          Text('加载更多')
            .fontSize(14)
            .fontColor('#007DFF')
        }
        .width('100%')
        .height(48)
        .justifyContent(FlexAlign.Center)
        .onClick(async () => {
          if (!this.isLoadingMore) {
            this.isLoadingMore = true
            this.currentPage++
            await this.loadBooks(false)
            this.isLoadingMore = false
          }
        })
      }
    }
    .layoutWeight(1)
  }

  @Builder
  FilterPanel() {
    Column() {
      Row() {
        Text('格式:')
          .fontSize(13)
          .fontColor('#999999')
          .margin({ right: 8 })

        Text('全部')
          .fontSize(13)
          .fontColor(this.selectedFormat === '' ? '#007DFF' : '#999999')
          .backgroundColor(this.selectedFormat === '' ? '#EBF1FF' : '#F5F5F5')
          .borderRadius(16)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .margin({ right: 6 })
          .onClick(() => {
            this.selectedFormat = ''
            this.loadBooks(true)
          })

        Text('EPUB')
          .fontSize(13)
          .fontColor(this.selectedFormat === 'epub' ? '#007DFF' : '#999999')
          .backgroundColor(this.selectedFormat === 'epub' ? '#EBF1FF' : '#F5F5F5')
          .borderRadius(16)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .margin({ right: 6 })
          .onClick(() => {
            this.selectedFormat = 'epub'
            this.loadBooks(true)
          })

        Text('PDF')
          .fontSize(13)
          .fontColor(this.selectedFormat === 'pdf' ? '#007DFF' : '#999999')
          .backgroundColor(this.selectedFormat === 'pdf' ? '#EBF1FF' : '#F5F5F5')
          .borderRadius(16)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .margin({ right: 6 })
          .onClick(() => {
            this.selectedFormat = 'pdf'
            this.loadBooks(true)
          })

        Text('TXT')
          .fontSize(13)
          .fontColor(this.selectedFormat === 'txt' ? '#007DFF' : '#999999')
          .backgroundColor(this.selectedFormat === 'txt' ? '#EBF1FF' : '#F5F5F5')
          .borderRadius(16)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .margin({ right: 6 })
          .onClick(() => {
            this.selectedFormat = 'txt'
            this.loadBooks(true)
          })
      }
      .width('100%')
      .margin({ bottom: 8 })

      Row() {
        Text('MOBI')
          .fontSize(13)
          .fontColor(this.selectedFormat === 'mobi' ? '#007DFF' : '#999999')
          .backgroundColor(this.selectedFormat === 'mobi' ? '#EBF1FF' : '#F5F5F5')
          .borderRadius(16)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .margin({ right: 6 })
          .onClick(() => {
            this.selectedFormat = 'mobi'
            this.loadBooks(true)
          })

        Text('AZW3')
          .fontSize(13)
          .fontColor(this.selectedFormat === 'azw3' ? '#007DFF' : '#999999')
          .backgroundColor(this.selectedFormat === 'azw3' ? '#EBF1FF' : '#F5F5F5')
          .borderRadius(16)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .margin({ right: 6 })
          .onClick(() => {
            this.selectedFormat = 'azw3'
            this.loadBooks(true)
          })
      }
      .width('100%')
      .margin({ bottom: 8 })

      Row() {
        Text('清除筛选')
          .fontSize(13)
          .fontColor('#FA2A2D')
          .onClick(() => {
            this.selectedFormat = ''
            this.selectedTagId = 0
            this.sortField = 'createdAt'
            this.sortOrder = 'desc'
            this.loadBooks(true)
          })
      }
      .width('100%')
      .justifyContent(FlexAlign.End)
    }
    .width('100%')
    .padding({ left: 16, right: 16, top: 8, bottom: 8 })
    .backgroundColor('#FFFFFF')
    .borderRadius(12)
    .margin({ left: 16, right: 16, bottom: 8 })
    .shadow({ radius: 6, color: '#10000000', offsetY: 1 })
  }

  @Builder
  BookCard(book: Book) {
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
          .position({ x: '68%', y: 8 })
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

        Text(`${formatFileSize(book.fileSize)}`)
          .fontSize(12)
          .fontColor('#999999')
          .margin({ top: 4 })
      }
      .padding({ left: 10, right: 10, top: 10, bottom: 12 })
      .alignItems(HorizontalAlign.Start)
    }
    .width('100%')
    .backgroundColor('#FFFFFF')
    .borderRadius(12)
    .shadow({
      radius: 8,
      color: '#10000000',
      offsetY: 2
    })
    .onClick(() => {
      let p = new NavParams(); p.bookId = book.id; navigateTo(this.getUIContext(), 'pages/BookDetailPage', p)
    })
  }
}