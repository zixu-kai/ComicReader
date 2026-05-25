import { router } from '@kit.ArkUI'
import { navigateTo, NavParams } from '../common/Constants'
import { BookService, BookmarkService } from '../service/ComicService'
import { Book, Tag, BookmarkItem } from '../model/ComicModels'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B'
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB'
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }
}

@Entry
@Component
struct BookDetailPage {
  @State book: Book | null = null
  @State rating: number = 0
  @State readingStatus: string = ''
  @State bookId: number = 0
  @State isBookmarked: boolean = false
  @State showEditDialog: boolean = false
  @State showCoverDialog: boolean = false
  @State editTitle: string = ''
  @State editAuthor: string = ''
  @State editDescription: string = ''
  @State editPublisher: string = ''
  @State editLanguage: string = ''
  @State editIsbn: string = ''
  @State toastMessage: string = ''
  @State showToast: boolean = false

  aboutToAppear(): void {
    const params = this.getUIContext().getRouter().getParams() as Record<string, number>
    if (params && params.bookId) {
      this.bookId = params.bookId
      this.loadBook()
      this.loadBookmarkStatus()
    }
  }

  async loadBook(): Promise<void> {
    try {
      this.book = await BookService.getBook(this.bookId)
      if (this.book) {
        if (this.book.rating) {
          this.rating = this.book.rating.score
          this.readingStatus = this.book.rating.readingStatus
        }
      }
    } catch (e) {
      console.error('Failed to load book: ' + JSON.stringify(e))
    }
  }

  async loadBookmarkStatus(): Promise<void> {
    try {
      const bmList: BookmarkItem[] = await BookmarkService.getBookmarks()
      const bm = bmList[0]
      if (bm) {
        this.isBookmarked = (bm.bookIds || []).includes(this.bookId)
      }
    } catch (e) {
      console.error('Failed to load bookmark status: ' + JSON.stringify(e))
    }
  }

  async setRating(score: number): Promise<void> {
    try {
      const status = this.readingStatus || 'want_to_read'
      await BookService.setRating(this.bookId, score, status)
      this.rating = score
      this.showMessage('评分已更新')
    } catch (e) {
      console.error('Failed to set rating: ' + JSON.stringify(e))
    }
  }

  async setReadingStatus(status: string): Promise<void> {
    try {
      const score = this.rating || 0
      await BookService.setRating(this.bookId, score, status)
      this.readingStatus = status
    } catch (e) {
      console.error('Failed to set reading status: ' + JSON.stringify(e))
    }
  }

  onDeleteBook(): void {
    AlertDialog.show({
      title: '确认删除',
      message: `确定要删除「${this.book?.title}」吗？此操作不可恢复。`,
      primaryButton: {
        value: '取消',
        action: () => {}
      },
      secondaryButton: {
        value: '删除',
        action: async () => {
          try {
            await BookService.deleteBook(this.bookId)
            try { this.getUIContext().getRouter().back() } catch (e) { console.error('Back failed: ' + JSON.stringify(e)) }
          } catch (e) {
            console.error('Failed to delete book: ' + JSON.stringify(e))
          }
        }
      }
    })
  }

  onStartReading(): void {
    let p = new NavParams(); p.bookId = this.bookId; navigateTo(this.getUIContext(), 'pages/BookReaderPage', p)
  }

  async toggleBookmark(): Promise<void> {
    try {
      const bmList: BookmarkItem[] = await BookmarkService.getBookmarks()
      if (bmList.length === 0) {
        this.showMessage('暂无收藏列表')
        return
      }
      const bm = bmList[0]
      if (this.isBookmarked) {
        await BookmarkService.removeBook(bm.id, this.bookId)
        this.isBookmarked = false
        this.showMessage('已取消收藏')
      } else {
        await BookmarkService.addBook(bm.id, this.bookId)
        this.isBookmarked = true
        this.showMessage('已添加收藏')
      }
    } catch (e) {
      this.showMessage('操作失败，请重试')
    }
  }

  onOpenEditDialog(): void {
    if (this.book) {
      this.editTitle = this.book.title || ''
      this.editAuthor = this.book.author || ''
      this.editDescription = this.book.description || ''
      this.editPublisher = this.book.publisher || ''
      this.editLanguage = this.book.language || ''
      this.editIsbn = this.book.isbn || ''
      this.showEditDialog = true
    }
  }

  async onSaveEdit(): Promise<void> {
    try {
      const updatedBook = new Book()
      updatedBook.title = this.editTitle
      updatedBook.author = this.editAuthor
      updatedBook.description = this.editDescription
      updatedBook.publisher = this.editPublisher
      updatedBook.language = this.editLanguage
      updatedBook.isbn = this.editIsbn
      await BookService.updateBook(this.bookId, updatedBook)
      this.showEditDialog = false
      this.showMessage('已保存修改')
      await this.loadBook()
    } catch (e) {
      this.showMessage('保存失败')
    }
  }

  showMessage(msg: string): void {
    this.toastMessage = msg
    this.showToast = true
    setTimeout(() => {
      this.showToast = false
    }, 2000)
  }

  onDownload(): void {
    try {
      const url = BookService.getCoverUrl(this.bookId)
      this.showMessage('下载链接: ' + url)
    } catch (e) {
      this.showMessage('下载失败')
    }
  }

  onExportEpub(): void {
    if (this.book && this.book.format === 'txt') {
      this.showMessage('正在导出 EPUB...')
      setTimeout(() => {
        this.showMessage('EPUB 导出功能需要通过接口触发')
      }, 1000)
    } else if (this.book) {
      this.showMessage('仅支持 TXT 格式导出 EPUB')
    } else {
      this.showMessage('无法执行导出')
    }
  }

  getFormatLabel(format: string): string {
    switch (format) {
      case 'pdf':
        return 'PDF'
      case 'epub':
        return 'EPUB'
      case 'txt':
        return 'TXT'
      default:
        return format.toUpperCase()
    }
  }

  getFormatColor(format: string): string {
    switch (format) {
      case 'pdf':
        return '#EF4444'
      case 'epub':
        return '#22C55E'
      case 'txt':
        return '#F59E0B'
      default:
        return '#9CA3AF'
    }
  }

  build() {
    Column() {
      if (this.showToast) {
        Row() {
          Text(this.toastMessage)
            .fontSize(14)
            .fontColor('#FFFFFF')
        }
        .width('100%')
        .padding(12)
        .backgroundColor('#374151')
        .justifyContent(FlexAlign.Center)
        .position({ x: 0, y: 56 })
        .zIndex(100)
      }

      Row() {
        Image($r('sys.media.ohos_ic_public_arrow_left'))
          .width(24)
          .height(24)
          .fillColor('#E5E7EB')
          .onClick(() => { try { this.getUIContext().getRouter().back() } catch (e) { console.error('Back failed: ' + JSON.stringify(e)) } })

        Text('图书详情')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#E5E7EB')
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
      .backgroundColor('#111827')

      if (this.book) {
        Scroll() {
          Column() {
            this.CoverSection()
            this.InfoSection()
            this.RatingSection()
            this.ReadingStatusSection()
            this.ActionButtons()
            this.CategoriesAndTags()
          }
          .padding({ left: 16, right: 16, bottom: 24 })
        }
        .layoutWeight(1)
        .width('100%')
        .scrollBar(BarState.Auto)
      } else {
        Column() {
          LoadingProgress()
            .width(48)
            .height(48)
            .color('#8B5CF6')
        }
        .layoutWeight(1)
        .width('100%')
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
      }

      if (this.showEditDialog) {
        this.EditDialog()
      }

      if (this.showCoverDialog) {
        this.CoverDialog()
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#0F172A')
  }

  @Builder
  CoverSection() {
    Column() {
      Stack() {
        Image(BookService.getCoverUrl(this.bookId))
          .width('100%')
          .height(320)
          .objectFit(ImageFit.Cover)
          .borderRadius({ topLeft: 12, topRight: 12 })
          .interpolation(ImageInterpolation.High)

        Column() {
          Text('更换封面')
            .fontSize(12)
            .fontColor('#FFFFFF')
        }
        .width('100%')
        .height(320)
        .backgroundColor('#66000000')
        .borderRadius({ topLeft: 12, topRight: 12 })
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
        .opacity(0)
        .onClick(() => {
          this.showCoverDialog = true
        })
      }
      .width('100%')
      .height(320)
    }
    .width('100%')
    .borderRadius(12)
    .clip(true)
    .margin({ top: 12 })
  }

  @Builder
  InfoSection() {
    Column() {
      Text(this.book!.title)
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .fontColor('#E5E7EB')
        .width('100%')

      if (this.book!.author) {
        Row() {
          Text('作者: ')
            .fontSize(14)
            .fontColor('#9CA3AF')
          Text(this.book!.author)
            .fontSize(14)
            .fontColor('#E5E7EB')
        }
        .width('100%')
        .margin({ top: 6 })
      }

      if (this.book!.description) {
        Text(this.book!.description)
          .fontSize(13)
          .fontColor('#9CA3AF')
          .width('100%')
          .margin({ top: 8 })
          .maxLines(4)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
      }

      Flex({ wrap: FlexWrap.Wrap }) {
        Row() {
          Text(this.getFormatLabel(this.book!.format))
            .fontSize(12)
            .fontColor(this.getFormatColor(this.book!.format))
        }
        .backgroundColor('#1F2937')
        .borderRadius(6)
        .padding({ left: 8, right: 8, top: 4, bottom: 4 })
        .margin({ right: 8 })

        if (this.book!.pageCount !== null && this.book!.pageCount! > 0) {
          Row() {
            Text(`${this.book!.pageCount} 页`)
              .fontSize(12)
              .fontColor('#9CA3AF')
          }
          .backgroundColor('#1F2937')
          .borderRadius(6)
          .padding({ left: 8, right: 8, top: 4, bottom: 4 })
          .margin({ right: 8 })
        }

        Row() {
          Text(formatFileSize(this.book!.fileSize))
            .fontSize(12)
            .fontColor('#9CA3AF')
        }
        .backgroundColor('#1F2937')
        .borderRadius(6)
        .padding({ left: 8, right: 8, top: 4, bottom: 4 })
        .margin({ right: 8 })

        if (this.book!.publisher) {
          Row() {
            Text(this.book!.publisher)
              .fontSize(12)
              .fontColor('#9CA3AF')
          }
          .backgroundColor('#1F2937')
          .borderRadius(6)
          .padding({ left: 8, right: 8, top: 4, bottom: 4 })
          .margin({ right: 8 })
        }

        if (this.book!.language) {
          Row() {
            Text(this.book!.language.toUpperCase())
              .fontSize(12)
              .fontColor('#9CA3AF')
          }
          .backgroundColor('#1F2937')
          .borderRadius(6)
          .padding({ left: 8, right: 8, top: 4, bottom: 4 })
          .margin({ right: 8 })
        }

        if (this.book!.isbn) {
          Row() {
            Text(`ISBN: ${this.book!.isbn}`)
              .fontSize(12)
              .fontColor('#9CA3AF')
          }
          .backgroundColor('#1F2937')
          .borderRadius(6)
          .padding({ left: 8, right: 8, top: 4, bottom: 4 })
        }
      }
      .width('100%')
      .margin({ top: 10 })
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#1F2937')
    .borderRadius(12)
    .margin({ top: 12 })
  }

  @Builder
  RatingSection() {
    Column() {
      Text('评分')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor('#E5E7EB')
        .width('100%')
        .margin({ bottom: 12 })

      Row() {
        ForEach([1, 2, 3, 4, 5], (star: number) => {
          Text(star <= this.rating ? '★' : '☆')
            .fontSize(32)
            .fontColor(star <= this.rating ? '#FBBF24' : '#4B5563')
            .margin({ right: 8 })
            .onClick(() => {
              this.setRating(star)
            })
        })
      }
      .width('100%')
      .justifyContent(FlexAlign.Center)
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#1F2937')
    .borderRadius(12)
    .margin({ top: 12 })
  }

  @Builder
  ReadingStatusSection() {
    Column() {
      Text('阅读状态')
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor('#E5E7EB')
        .width('100%')
        .margin({ bottom: 12 })

      Row() {
        this.StatusButton('想读', 'want_to_read')
        this.StatusButton('在读', 'reading')
        this.StatusButton('已读', 'read')
        this.StatusButton('弃读', 'dropped')
      }
      .width('100%')
      .justifyContent(FlexAlign.SpaceBetween)
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#1F2937')
    .borderRadius(12)
    .margin({ top: 12 })
  }

  @Builder
  StatusButton(label: string, status: string) {
    Text(label)
      .fontSize(14)
      .fontColor(this.readingStatus === status ? '#FFFFFF' : '#9CA3AF')
      .backgroundColor(this.readingStatus === status ? '#8B5CF6' : '#374151')
      .borderRadius(8)
      .padding({ left: 16, right: 16, top: 8, bottom: 8 })
      .onClick(() => {
        this.setReadingStatus(status)
      })
  }

  @Builder
  ActionButtons() {
    Column() {
      Row() {
        Button('开始阅读')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FFFFFF')
          .backgroundColor('#8B5CF6')
          .borderRadius(10)
          .layoutWeight(1)
          .height(48)
          .onClick(() => {
            this.onStartReading()
          })

        Button(this.isBookmarked ? '已收藏' : '收藏')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor(this.isBookmarked ? '#8B5CF6' : '#9CA3AF')
          .border({ width: 1, color: this.isBookmarked ? '#8B5CF6' : '#374151' })
          .backgroundColor(this.isBookmarked ? '#2E1065' : '#374151')
          .borderRadius(10)
          .width(80)
          .height(48)
          .margin({ left: 8 })
          .onClick(() => {
            this.toggleBookmark()
          })
      }
      .width('100%')
      .margin({ bottom: 8 })

      Row() {
        Button('编辑信息')
          .fontSize(14)
          .fontColor('#9CA3AF')
          .backgroundColor('#374151')
          .borderRadius(10)
          .layoutWeight(1)
          .height(40)
          .onClick(() => {
            this.onOpenEditDialog()
          })

        Button('下载')
          .fontSize(14)
          .fontColor('#9CA3AF')
          .backgroundColor('#374151')
          .borderRadius(10)
          .layoutWeight(1)
          .height(40)
          .margin({ left: 8 })
          .onClick(() => {
            this.onDownload()
          })

        if (this.book!.format === 'txt') {
          Button('导出EPUB')
            .fontSize(14)
            .fontColor('#22C55E')
            .backgroundColor('#374151')
            .borderRadius(10)
            .layoutWeight(1)
            .height(40)
            .margin({ left: 8 })
            .onClick(() => {
              this.onExportEpub()
            })
        }

        Button('删除')
          .fontSize(14)
          .fontColor('#EF4444')
          .backgroundColor('#374151')
          .borderRadius(10)
          .width(80)
          .height(40)
          .margin({ left: 8 })
          .onClick(() => {
            this.onDeleteBook()
          })
      }
      .width('100%')
    }
    .width('100%')
    .margin({ top: 12 })
  }

  @Builder
  CategoriesAndTags() {
    if (this.book!.tags && this.book!.tags.length > 0) {
      Column() {
        Text('标签')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#E5E7EB')
          .width('100%')
          .margin({ bottom: 8 })

        Flex({ wrap: FlexWrap.Wrap }) {
          ForEach(this.book!.tags, (tag: Tag) => {
            Text(tag.name)
              .fontSize(13)
              .fontColor('#A78BFA')
              .backgroundColor('#2E1065')
              .borderRadius(16)
              .padding({ left: 12, right: 12, top: 6, bottom: 6 })
              .margin({ right: 8, bottom: 8 })
              .onClick(() => {
                let p = new NavParams(); p.tagId = tag.id; navigateTo(this.getUIContext(), 'pages/BookLibraryPage', p)
              })
          })
        }
        .width('100%')
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#1F2937')
      .borderRadius(12)
      .margin({ top: 12 })
    }
  }

  @Builder
  EditDialog() {
    Column() {
      Column() {
        Row() {
          Text('编辑图书信息')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#E5E7EB')

          Blank()

          Image($r('sys.media.ohos_ic_public_remove'))
            .width(20)
            .height(20)
            .fillColor('#9CA3AF')
            .onClick(() => {
              this.showEditDialog = false
            })
        }
        .width('100%')
        .margin({ bottom: 16 })

        Text('标题')
          .fontSize(13)
          .fontColor('#9CA3AF')
          .width('100%')
          .margin({ bottom: 4 })

        TextInput({ text: this.editTitle, placeholder: '输入标题' })
          .width('100%')
          .height(40)
          .fontColor('#E5E7EB')
          .backgroundColor('#374151')
          .borderRadius(8)
          .onChange((value: string) => {
            this.editTitle = value
          })

        Text('作者')
          .fontSize(13)
          .fontColor('#9CA3AF')
          .width('100%')
          .margin({ top: 12, bottom: 4 })

        TextInput({ text: this.editAuthor, placeholder: '输入作者' })
          .width('100%')
          .height(40)
          .fontColor('#E5E7EB')
          .backgroundColor('#374151')
          .borderRadius(8)
          .onChange((value: string) => {
            this.editAuthor = value
          })

        Text('简介')
          .fontSize(13)
          .fontColor('#9CA3AF')
          .width('100%')
          .margin({ top: 12, bottom: 4 })

        TextInput({ text: this.editDescription, placeholder: '输入简介' })
          .width('100%')
          .height(80)
          .fontColor('#E5E7EB')
          .backgroundColor('#374151')
          .borderRadius(8)
          .onChange((value: string) => {
            this.editDescription = value
          })

        Text('出版社')
          .fontSize(13)
          .fontColor('#9CA3AF')
          .width('100%')
          .margin({ top: 12, bottom: 4 })

        TextInput({ text: this.editPublisher, placeholder: '输入出版社' })
          .width('100%')
          .height(40)
          .fontColor('#E5E7EB')
          .backgroundColor('#374151')
          .borderRadius(8)
          .onChange((value: string) => {
            this.editPublisher = value
          })

        Text('语言')
          .fontSize(13)
          .fontColor('#9CA3AF')
          .width('100%')
          .margin({ top: 12, bottom: 4 })

        TextInput({ text: this.editLanguage, placeholder: '输入语言 (如 zh, en)' })
          .width('100%')
          .height(40)
          .fontColor('#E5E7EB')
          .backgroundColor('#374151')
          .borderRadius(8)
          .onChange((value: string) => {
            this.editLanguage = value
          })

        Text('ISBN')
          .fontSize(13)
          .fontColor('#9CA3AF')
          .width('100%')
          .margin({ top: 12, bottom: 4 })

        TextInput({ text: this.editIsbn, placeholder: '输入ISBN' })
          .width('100%')
          .height(40)
          .fontColor('#E5E7EB')
          .backgroundColor('#374151')
          .borderRadius(8)
          .onChange((value: string) => {
            this.editIsbn = value
          })

        Row() {
          Button('取消')
            .layoutWeight(1)
            .height(40)
            .fontSize(14)
            .fontColor('#9CA3AF')
            .backgroundColor('#374151')
            .borderRadius(20)
            .onClick(() => {
              this.showEditDialog = false
            })

          Button('保存')
            .layoutWeight(1)
            .height(40)
            .fontSize(14)
            .fontColor('#FFFFFF')
            .backgroundColor('#8B5CF6')
            .borderRadius(20)
            .margin({ left: 12 })
            .onClick(() => {
              this.onSaveEdit()
            })
        }
        .width('100%')
        .margin({ top: 20 })
      }
      .width('85%')
      .backgroundColor('#1F2937')
      .borderRadius(16)
      .padding(24)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#99000000')
    .justifyContent(FlexAlign.Center)
    .position({ x: 0, y: 0 })
    .zIndex(999)
  }

  @Builder
  CoverDialog() {
    Column() {
      Column() {
        Row() {
          Text('更换封面')
            .fontSize(18)
            .fontWeight(FontWeight.Bold)
            .fontColor('#E5E7EB')

          Blank()

          Image($r('sys.media.ohos_ic_public_remove'))
            .width(20)
            .height(20)
            .fillColor('#9CA3AF')
            .onClick(() => {
              this.showCoverDialog = false
            })
        }
        .width('100%')
        .margin({ bottom: 16 })

        Text('当前封面')
          .fontSize(13)
          .fontColor('#9CA3AF')
          .width('100%')
          .margin({ bottom: 8 })

        Image(BookService.getCoverUrl(this.bookId))
          .width('100%')
          .height(200)
          .objectFit(ImageFit.Cover)
          .borderRadius(8)

        Text('提示：请通过服务端接口上传新封面')
          .fontSize(12)
          .fontColor('#6B7280')
          .width('100%')
          .margin({ top: 12 })
          .textAlign(TextAlign.Center)

        Button('关闭')
          .width('100%')
          .height(40)
          .fontSize(14)
          .fontColor('#FFFFFF')
          .backgroundColor('#8B5CF6')
          .borderRadius(20)
          .margin({ top: 16 })
          .onClick(() => {
            this.showCoverDialog = false
          })
      }
      .width('85%')
      .backgroundColor('#1F2937')
      .borderRadius(16)
      .padding(24)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#99000000')
    .justifyContent(FlexAlign.Center)
    .position({ x: 0, y: 0 })
    .zIndex(999)
  }
}