import { router } from '@kit.ArkUI'
import { navigateTo, NavParams } from '../common/Constants'
import { ComicService, BookmarkService } from '../service/ComicService'
import { Comic, Chapter, ComicRating, Category, Tag, BookmarkItem } from '../model/ComicModels'
import { photoAccessHelper } from '@kit.MediaLibraryKit'
import { fileIo } from '@kit.CoreFileKit'

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
struct ComicDetailPage {
  @State comic: Comic | null = null
  @State chapters: Chapter[] = []
  @State rating: number = 0
  @State readingStatus: string = ''
  @State comicId: number = 0
  @State currentChapterId: number = 0
  @State isBookmarked: boolean = false
  @State bookmarkList: BookmarkItem[] = []
  @State showEditDialog: boolean = false
  @State showCoverDialog: boolean = false
  @State editTitle: string = ''
  @State editAuthor: string = ''
  @State editArtist: string = ''
  @State editDescription: string = ''
  @State editStatus: string = 'unknown'
  @State toastMessage: string = ''
  @State showToast: boolean = false

  aboutToAppear(): void {
    const params = this.getUIContext().getRouter().getParams() as Record<string, number>
    if (params && params.comicId) {
      this.comicId = params.comicId
      this.loadComic()
      this.loadChapters()
      this.loadBookmarkStatus()
    }
  }

  async loadComic(): Promise<void> {
    try {
      this.comic = await ComicService.getComic(this.comicId)
      if (this.comic) {
        if (this.comic.rating) {
          this.rating = this.comic.rating.score
          this.readingStatus = this.comic.rating.readingStatus
        }
        if (this.comic.readingProgress) {
          this.currentChapterId = this.comic.readingProgress.chapterId
        }
      }
    } catch (e) {
      console.error('Failed to load comic: ' + JSON.stringify(e))
    }
  }

  async loadChapters(): Promise<void> {
    try {
      this.chapters = await ComicService.getChapters(this.comicId)
    } catch (e) {
      console.error('Failed to load chapters: ' + JSON.stringify(e))
    }
  }

  async loadBookmarkStatus(): Promise<void> {
    try {
      const bmList: BookmarkItem[] = await BookmarkService.getBookmarks()
      this.bookmarkList = bmList
      const bm = bmList[0]
      if (bm) {
        this.isBookmarked = (bm.comicIds || []).includes(this.comicId)
      }
    } catch (e) {
      console.error('Failed to load bookmark status: ' + JSON.stringify(e))
    }
  }

  async setRating(score: number): Promise<void> {
    try {
      const status = this.readingStatus || 'want_to_read'
      await ComicService.setRating(this.comicId, score, status)
      this.rating = score
      this.showMessage('评分已更新')
    } catch (e) {
      console.error('Failed to set rating: ' + JSON.stringify(e))
    }
  }

  async setReadingStatus(status: string): Promise<void> {
    try {
      const score = this.rating || 0
      await ComicService.setRating(this.comicId, score, status)
      this.readingStatus = status
    } catch (e) {
      console.error('Failed to set reading status: ' + JSON.stringify(e))
    }
  }

  onDeleteComic(): void {
    AlertDialog.show({
      title: '确认删除',
      message: `确定要删除「${this.comic?.title}」吗？此操作不可恢复。`,
      primaryButton: {
        value: '取消',
        action: () => {}
      },
      secondaryButton: {
        value: '删除',
        action: async () => {
          try {
            await ComicService.deleteComic(this.comicId)
            try { this.getUIContext().getRouter().back() } catch (e) { console.error('Back failed: ' + JSON.stringify(e)) }
          } catch (e) {
            console.error('Failed to delete comic: ' + JSON.stringify(e))
          }
        }
      }
    })
  }

  onReadChapter(chapterId: number): void {
    let p = new NavParams(); p.comicId = this.comicId; p.chapterId = chapterId; navigateTo(this.getUIContext(), 'pages/ComicReaderPage', p)
  }

  onStartReading(): void {
    if (this.currentChapterId > 0) {
      this.onReadChapter(this.currentChapterId)
    } else if (this.chapters.length > 0) {
      this.onReadChapter(this.chapters[0].id)
    }
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
        await BookmarkService.removeComic(bm.id, this.comicId)
        this.isBookmarked = false
        this.showMessage('已取消收藏')
      } else {
        await BookmarkService.addComic(bm.id, this.comicId)
        this.isBookmarked = true
        this.showMessage('已添加收藏')
      }
    } catch (e) {
      this.showMessage('操作失败，请重试')
    }
  }

  onOpenEditDialog(): void {
    if (this.comic) {
      this.editTitle = this.comic.title || ''
      this.editAuthor = this.comic.author || ''
      this.editArtist = this.comic.artist || ''
      this.editDescription = this.comic.description || ''
      this.editStatus = this.comic.status || 'unknown'
      this.showEditDialog = true
    }
  }

  async onSaveEdit(): Promise<void> {
    try {
      const updatedComic = new Comic()
      updatedComic.title = this.editTitle
      updatedComic.author = this.editAuthor
      updatedComic.artist = this.editArtist
      updatedComic.description = this.editDescription
      updatedComic.status = this.editStatus
      await ComicService.updateComic(this.comicId, updatedComic)
      this.showEditDialog = false
      this.showMessage('已保存修改')
      await this.loadComic()
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
      const url = ComicService.getCoverUrl(this.comicId)
      this.showMessage('下载链接: ' + url)
    } catch (e) {
      this.showMessage('下载失败')
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ongoing':
        return '连载中'
      case 'completed':
        return '已完结'
      case 'unknown':
        return '未知'
      default:
        return status
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ongoing':
        return '#22C55E'
      case 'completed':
        return '#6366F1'
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

        Text('漫画详情')
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

      if (this.comic) {
        Scroll() {
          Column() {
            this.CoverSection()
            this.InfoSection()
            this.RatingSection()
            this.ReadingStatusSection()
            this.ActionButtons()
            this.CategoriesAndTags()
            this.ChapterList()
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
            .color('#6366F1')
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
        Image(ComicService.getCoverUrl(this.comicId))
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
      Text(this.comic!.title)
        .fontSize(22)
        .fontWeight(FontWeight.Bold)
        .fontColor('#E5E7EB')
        .width('100%')
        .margin({ top: 16 })

      if (this.comic!.author) {
        Row() {
          Text('作者: ')
            .fontSize(14)
            .fontColor('#9CA3AF')
          Text(this.comic!.author)
            .fontSize(14)
            .fontColor('#E5E7EB')
        }
        .width('100%')
        .margin({ top: 6 })
      }

      if (this.comic!.artist) {
        Row() {
          Text('画师: ')
            .fontSize(14)
            .fontColor('#9CA3AF')
          Text(this.comic!.artist)
            .fontSize(14)
            .fontColor('#E5E7EB')
        }
        .width('100%')
        .margin({ top: 4 })
      }

      if (this.comic!.description) {
        Text(this.comic!.description)
          .fontSize(13)
          .fontColor('#9CA3AF')
          .width('100%')
          .margin({ top: 8 })
          .maxLines(4)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
      }

      Flex({ wrap: FlexWrap.Wrap }) {
        if (this.comic!.year) {
          Row() {
            Text(`${this.comic!.year}`)
              .fontSize(12)
              .fontColor('#9CA3AF')
          }
          .backgroundColor('#1F2937')
          .borderRadius(6)
          .padding({ left: 8, right: 8, top: 4, bottom: 4 })
          .margin({ right: 8 })
        }

        Row() {
          Text(`${this.comic!.pageCount} 页`)
            .fontSize(12)
            .fontColor('#9CA3AF')
        }
        .backgroundColor('#1F2937')
        .borderRadius(6)
        .padding({ left: 8, right: 8, top: 4, bottom: 4 })
        .margin({ right: 8 })

        Row() {
          Text(formatFileSize(this.comic!.fileSize))
            .fontSize(12)
            .fontColor('#9CA3AF')
        }
        .backgroundColor('#1F2937')
        .borderRadius(6)
        .padding({ left: 8, right: 8, top: 4, bottom: 4 })
        .margin({ right: 8 })

        if (this.comic!.fileType) {
          Row() {
            Text(this.comic!.fileType.toUpperCase())
              .fontSize(12)
              .fontColor('#9CA3AF')
          }
          .backgroundColor('#1F2937')
          .borderRadius(6)
          .padding({ left: 8, right: 8, top: 4, bottom: 4 })
          .margin({ right: 8 })
        }

        Row() {
          Text(this.getStatusLabel(this.comic!.status))
            .fontSize(12)
            .fontColor(this.getStatusColor(this.comic!.status))
        }
        .backgroundColor('#1F2937')
        .borderRadius(6)
        .padding({ left: 8, right: 8, top: 4, bottom: 4 })
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
      .backgroundColor(this.readingStatus === status ? '#6366F1' : '#374151')
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
        Button(this.currentChapterId > 0 ? '继续阅读' : '开始阅读')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FFFFFF')
          .backgroundColor('#6366F1')
          .borderRadius(10)
          .layoutWeight(1)
          .height(48)
          .onClick(() => {
            this.onStartReading()
          })

        Button(this.isBookmarked ? '已收藏' : '收藏')
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor(this.isBookmarked ? '#6366F1' : '#9CA3AF')
          .border({ width: 1, color: this.isBookmarked ? '#6366F1' : '#374151' })
          .backgroundColor(this.isBookmarked ? '#312E81' : '#374151')
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

        Button('删除')
          .fontSize(14)
          .fontColor('#EF4444')
          .backgroundColor('#374151')
          .borderRadius(10)
          .width(80)
          .height(40)
          .margin({ left: 8 })
          .onClick(() => {
            this.onDeleteComic()
          })
      }
      .width('100%')
    }
    .width('100%')
    .margin({ top: 12 })
  }

  @Builder
  CategoriesAndTags() {
    if ((this.comic!.categories && this.comic!.categories.length > 0) ||
      (this.comic!.tags && this.comic!.tags.length > 0)) {
      Column() {
        if (this.comic!.categories && this.comic!.categories.length > 0) {
          Text('分类')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#E5E7EB')
            .width('100%')
            .margin({ bottom: 8 })

          Flex({ wrap: FlexWrap.Wrap }) {
            ForEach(this.comic!.categories, (category: Category) => {
              Text(category.name)
                .fontSize(13)
                .fontColor('#818CF8')
                .backgroundColor('#312E81')
                .borderRadius(16)
                .padding({ left: 12, right: 12, top: 6, bottom: 6 })
                .margin({ right: 8, bottom: 8 })
                .onClick(() => {
                  let p = new NavParams(); p.categoryId = category.id; navigateTo(this.getUIContext(), 'pages/LibraryPage', p)
                })
            })
          }
          .width('100%')
        }

        if (this.comic!.tags && this.comic!.tags.length > 0) {
          Text('标签')
            .fontSize(16)
            .fontWeight(FontWeight.Medium)
            .fontColor('#E5E7EB')
            .width('100%')
            .margin({ bottom: 8, top: this.comic!.categories.length > 0 ? 12 : 0 })

          Flex({ wrap: FlexWrap.Wrap }) {
            ForEach(this.comic!.tags, (tag: Tag) => {
              Text(tag.name)
                .fontSize(13)
                .fontColor('#A78BFA')
                .backgroundColor('#2E1065')
                .borderRadius(16)
                .padding({ left: 12, right: 12, top: 6, bottom: 6 })
                .margin({ right: 8, bottom: 8 })
                .onClick(() => {
                  let p = new NavParams(); p.tagId = tag.id; navigateTo(this.getUIContext(), 'pages/LibraryPage', p)
                })
            })
          }
          .width('100%')
        }
      }
      .width('100%')
      .padding(16)
      .backgroundColor('#1F2937')
      .borderRadius(12)
      .margin({ top: 12 })
    }
  }

  @Builder
  ChapterList() {
    if (this.chapters.length > 0) {
      Column() {
        Text(`章节 (${this.chapters.length})`)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .fontColor('#E5E7EB')
          .width('100%')
          .margin({ bottom: 12 })

        Grid() {
          ForEach(this.chapters, (chapter: Chapter) => {
            GridItem() {
              Column() {
                Text(chapter.title || `第${chapter.chapterNumber}话`)
                  .fontSize(13)
                  .fontColor(chapter.id === this.currentChapterId ? '#6366F1' : '#E5E7EB')
                  .maxLines(1)
                  .textOverflow({ overflow: TextOverflow.Ellipsis })
                  .width('100%')

                if (chapter.pageCount > 0) {
                  Text(`${chapter.pageCount}页`)
                    .fontSize(11)
                    .fontColor('#9CA3AF')
                    .width('100%')
                    .margin({ top: 2 })
                }
              }
              .width('100%')
              .padding(10)
              .backgroundColor(chapter.id === this.currentChapterId ? '#312E81' : '#374151')
              .borderRadius(8)
              .border(chapter.id === this.currentChapterId ? {
                width: 1,
                color: '#6366F1'
              } : undefined)
              .onClick(() => {
                this.onReadChapter(chapter.id)
              })
            }
            .padding(4)
          })
        }
        .columnsTemplate('1fr 1fr 1fr')
        .rowsGap(4)
        .columnsGap(4)
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
          Text('编辑信息')
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

        Text('画师')
          .fontSize(13)
          .fontColor('#9CA3AF')
          .width('100%')
          .margin({ top: 12, bottom: 4 })

        TextInput({ text: this.editArtist, placeholder: '输入画师' })
          .width('100%')
          .height(40)
          .fontColor('#E5E7EB')
          .backgroundColor('#374151')
          .borderRadius(8)
          .onChange((value: string) => {
            this.editArtist = value
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

        Text('状态')
          .fontSize(13)
          .fontColor('#9CA3AF')
          .width('100%')
          .margin({ top: 12, bottom: 4 })

        Row() {
          Text('未知')
            .fontSize(13)
            .fontColor(this.editStatus === 'unknown' ? '#FFFFFF' : '#9CA3AF')
            .backgroundColor(this.editStatus === 'unknown' ? '#6366F1' : '#374151')
            .borderRadius(8)
            .padding({ left: 12, right: 12, top: 6, bottom: 6 })
            .margin({ right: 8 })
            .onClick(() => { this.editStatus = 'unknown' })

          Text('连载中')
            .fontSize(13)
            .fontColor(this.editStatus === 'ongoing' ? '#FFFFFF' : '#9CA3AF')
            .backgroundColor(this.editStatus === 'ongoing' ? '#6366F1' : '#374151')
            .borderRadius(8)
            .padding({ left: 12, right: 12, top: 6, bottom: 6 })
            .margin({ right: 8 })
            .onClick(() => { this.editStatus = 'ongoing' })

          Text('已完结')
            .fontSize(13)
            .fontColor(this.editStatus === 'completed' ? '#FFFFFF' : '#9CA3AF')
            .backgroundColor(this.editStatus === 'completed' ? '#6366F1' : '#374151')
            .borderRadius(8)
            .padding({ left: 12, right: 12, top: 6, bottom: 6 })
            .onClick(() => { this.editStatus = 'completed' })
        }

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
            .backgroundColor('#6366F1')
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

        Image(ComicService.getCoverUrl(this.comicId))
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
          .backgroundColor('#6366F1')
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