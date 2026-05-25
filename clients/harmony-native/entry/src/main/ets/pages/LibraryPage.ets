import { Comic, ComicQueryParams, PaginatedResponse, Tag, Category } from '../model/ComicModels'
import { ComicService, TagService, CategoryService } from '../service/ComicService'
import { ComicCard } from '../components/ComicCard'
import { TabBar } from '../components/TabBar'
import { Constants, navigateTo, navigateToTab, NavParams } from '../common/Constants'

@Entry
@Component
struct LibraryPage {
  @State comics: Comic[] = []
  @State tags: Tag[] = []
  @State categories: Category[] = []
  @State currentTab: number = 1
  @State searchQuery: string = ''
  @State selectedTagId: number = 0
  @State selectedCategoryId: number = 0
  @State selectedStatus: string = ''
  @State sortField: string = 'createdAt'
  @State sortOrder: string = 'desc'
  @State currentPage: number = 1
  @State totalPages: number = 1
  @State totalComics: number = 0
  @State isRefreshing: boolean = false
  @State isLoadingMore: boolean = false
  @State showFilter: boolean = false

  aboutToAppear(): void {
    this.loadComics(true)
    this.loadTags()
    this.loadCategories()
  }

  onTabChange(tab: number): void {
    if (tab === 0) {
      navigateToTab(this.getUIContext(), 'pages/HomePage')
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

  async loadComics(reset: boolean): Promise<void> {
    if (reset) {
      this.currentPage = 1
    }
    try {
      let params = new ComicQueryParams()
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
      if (this.selectedCategoryId > 0) {
        params.categoryId = this.selectedCategoryId
      }
      if (this.selectedStatus) {
        params.status = this.selectedStatus
      }
      const res: PaginatedResponse<Comic> = await ComicService.getComics(params)
      if (reset) {
        this.comics = res.data
      } else {
        this.comics = this.comics.concat(res.data)
      }
      this.totalPages = res.totalPages
      this.totalComics = res.total
    } catch (e) {
      console.error('Failed to load comics: ' + JSON.stringify(e))
    }
  }

  async loadTags(): Promise<void> {
    try {
      this.tags = await TagService.getTags()
    } catch (e) {
      console.error('Failed to load tags: ' + JSON.stringify(e))
    }
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await CategoryService.getCategories()
    } catch (e) {
      console.error('Failed to load categories: ' + JSON.stringify(e))
    }
  }

  build() {
    Column() {
      this.LibraryContent()

      TabBar({ currentTab: $currentTab, onTabClick: (tab: number) => {
        this.onTabChange(tab)
      } })
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F1F3F5')
  }

  @Builder
  LibraryContent() {
    Column() {
      Row() {
        Search({ value: this.searchQuery, placeholder: '搜索漫画' })
          .layoutWeight(1)
          .height(40)
          .backgroundColor('#FFFFFF')
          .fontColor('#181818')
          .borderRadius(20)
          .onChange((value: string) => {
            this.searchQuery = value
          })
          .onSubmit(() => {
            this.loadComics(true)
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
                this.loadComics(true)
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
                  this.loadComics(true)
                })
            })
          }
        }
        .scrollable(ScrollDirection.Horizontal)
        .width('100%')
        .padding({ left: 16, right: 16, bottom: 8 })
      }

      Row() {
        Text(`共 ${this.totalComics} 部`)
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
              this.loadComics(true)
            })

          Text(this.sortOrder === 'desc' ? '↓' : '↑')
            .fontSize(12)
            .fontColor('#007DFF')
            .margin({ left: 4 })
            .onClick(() => {
              this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc'
              this.loadComics(true)
            })
        }
        .margin({ left: 'auto' })
      }
      .width('100%')
      .padding({ left: 16, right: 16, bottom: 8 })

      Refresh({ refreshing: $$this.isRefreshing }) {
        Grid() {
          ForEach(this.comics, (comic: Comic) => {
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
        .layoutWeight(1)
        .padding({ left: 12, right: 12 })
      }
      .onRefreshing(async () => {
        await this.loadComics(true)
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
            await this.loadComics(false)
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
        Text('状态:')
          .fontSize(13)
          .fontColor('#999999')
          .margin({ right: 8 })

        Text('全部')
          .fontSize(13)
          .fontColor(this.selectedStatus === '' ? '#007DFF' : '#999999')
          .backgroundColor(this.selectedStatus === '' ? '#EBF1FF' : '#F5F5F5')
          .borderRadius(16)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .margin({ right: 6 })
          .onClick(() => {
            this.selectedStatus = ''
            this.loadComics(true)
          })

        Text('连载中')
          .fontSize(13)
          .fontColor(this.selectedStatus === 'ongoing' ? '#007DFF' : '#999999')
          .backgroundColor(this.selectedStatus === 'ongoing' ? '#EBF1FF' : '#F5F5F5')
          .borderRadius(16)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .margin({ right: 6 })
          .onClick(() => {
            this.selectedStatus = 'ongoing'
            this.loadComics(true)
          })

        Text('已完结')
          .fontSize(13)
          .fontColor(this.selectedStatus === 'completed' ? '#007DFF' : '#999999')
          .backgroundColor(this.selectedStatus === 'completed' ? '#EBF1FF' : '#F5F5F5')
          .borderRadius(16)
          .padding({ left: 12, right: 12, top: 6, bottom: 6 })
          .margin({ right: 6 })
          .onClick(() => {
            this.selectedStatus = 'completed'
            this.loadComics(true)
          })
      }
      .width('100%')
      .margin({ bottom: 8 })

      if (this.categories.length > 0) {
        Row() {
          Text('分类:')
            .fontSize(13)
            .fontColor('#9CA3AF')
            .margin({ right: 8 })

          Scroll() {
            Row() {
              Text('全部')
                .fontSize(13)
                .fontColor(this.selectedCategoryId === 0 ? '#6366F1' : '#9CA3AF')
                .backgroundColor(this.selectedCategoryId === 0 ? '#312E81' : '#1F2937')
                .borderRadius(16)
                .padding({ left: 12, right: 12, top: 6, bottom: 6 })
                .margin({ right: 6 })
                .onClick(() => {
                  this.selectedCategoryId = 0
                  this.loadComics(true)
                })

              ForEach(this.categories, (cat: Category) => {
                Text(cat.name)
                  .fontSize(13)
                  .fontColor(this.selectedCategoryId === cat.id ? '#6366F1' : '#9CA3AF')
                  .backgroundColor(this.selectedCategoryId === cat.id ? '#312E81' : '#1F2937')
                  .borderRadius(16)
                  .padding({ left: 12, right: 12, top: 6, bottom: 6 })
                  .margin({ right: 6 })
                  .onClick(() => {
                    this.selectedCategoryId = cat.id
                    this.loadComics(true)
                  })
              })
            }
          }
          .scrollable(ScrollDirection.Horizontal)
          .layoutWeight(1)
        }
        .width('100%')
        .alignItems(VerticalAlign.Center)
        .margin({ bottom: 8 })
      }

      Row() {
        Text('清除筛选')
          .fontSize(13)
          .fontColor('#FA2A2D')
          .onClick(() => {
            this.selectedStatus = ''
            this.selectedCategoryId = 0
            this.selectedTagId = 0
            this.sortField = 'createdAt'
            this.sortOrder = 'desc'
            this.loadComics(true)
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
}
