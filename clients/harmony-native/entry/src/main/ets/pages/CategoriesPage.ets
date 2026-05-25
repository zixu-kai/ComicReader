import { Category, Tag } from '../model/ComicModels'
import { CategoryService, TagService } from '../service/ComicService'
import { navigateToTab } from '../common/Constants'

@Entry
@Component
struct CategoriesPage {
  @State categories: Category[] = []
  @State tags: Tag[] = []
  @State currentTab: number = 0
  @State showAddCategoryDialog: boolean = false
  @State showAddTagDialog: boolean = false
  @State showDeleteConfirmDialog: boolean = false
  @State deleteType: string = ''
  @State deleteId: number = 0
  @State deleteName: string = ''
  @State newCategoryName: string = ''
  @State newCategoryDescription: string = ''
  @State newTagName: string = ''

  aboutToAppear(): void {
    this.loadCategories()
    this.loadTags()
  }

  async loadCategories(): Promise<void> {
    try {
      this.categories = await CategoryService.getCategories()
    } catch (e) {
      console.error('Failed to load categories: ' + JSON.stringify(e))
    }
  }

  async loadTags(): Promise<void> {
    try {
      this.tags = await TagService.getTags()
    } catch (e) {
      console.error('Failed to load tags: ' + JSON.stringify(e))
    }
  }

  async createCategory(): Promise<void> {
    if (!this.newCategoryName.trim()) {
      return
    }
    try {
      await CategoryService.createCategory(this.newCategoryName.trim(), this.newCategoryDescription.trim() || undefined)
      this.showAddCategoryDialog = false
      this.newCategoryName = ''
      this.newCategoryDescription = ''
      this.loadCategories()
    } catch (e) {
      console.error('Failed to create category: ' + JSON.stringify(e))
    }
  }

  async createTag(): Promise<void> {
    if (!this.newTagName.trim()) {
      return
    }
    try {
      await TagService.createTag(this.newTagName.trim())
      this.showAddTagDialog = false
      this.newTagName = ''
      this.loadTags()
    } catch (e) {
      console.error('Failed to create tag: ' + JSON.stringify(e))
    }
  }

  async confirmDelete(): Promise<void> {
    try {
      if (this.deleteType === 'category') {
        await CategoryService.deleteCategory(this.deleteId)
        this.loadCategories()
      } else {
        await TagService.deleteTag(this.deleteId)
        this.loadTags()
      }
      this.showDeleteConfirmDialog = false
    } catch (e) {
      console.error('Failed to delete: ' + JSON.stringify(e))
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

        Text('分类与标签')
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

      Tabs({ index: this.currentTab }) {
        TabContent() {
          this.CategoryTab()
        }
        .tabBar('分类管理')

        TabContent() {
          this.TagTab()
        }
        .tabBar('标签管理')
      }
      .layoutWeight(1)
      .width('100%')
      .barMode(BarMode.Fixed)
      .barBackgroundColor('#FFFFFF')
      .animationDuration(0)
      .onChange((index: number) => {
        this.currentTab = index
      })

      if (this.showAddCategoryDialog) {
        this.AddCategoryDialog()
      }

      if (this.showAddTagDialog) {
        this.AddTagDialog()
      }

      if (this.showDeleteConfirmDialog) {
        this.DeleteConfirmDialog()
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F1F3F5')
  }

  @Builder
  CategoryTab() {
    Column() {
      Row() {
        Text(`共 ${this.categories.length} 个分类`)
          .fontSize(13)
          .fontColor('#999999')

        Blank()

        Button('新增分类')
          .height(32)
          .fontSize(13)
          .fontColor('#FFFFFF')
          .backgroundColor('#007DFF')
          .borderRadius(16)
          .padding({ left: 12, right: 12 })
          .onClick(() => {
            this.newCategoryName = ''
            this.newCategoryDescription = ''
            this.showAddCategoryDialog = true
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 8 })

      if (this.categories.length === 0) {
        Column() {
          Text('暂无分类')
            .fontSize(14)
            .fontColor('#CCCCCC')
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
      } else {
        List() {
          ForEach(this.categories, (category: Category) => {
            ListItem() {
              Row() {
                Column() {
                  Text(category.name)
                    .fontSize(15)
                    .fontColor('#181818')
                    .maxLines(1)
                    .textOverflow({ overflow: TextOverflow.Ellipsis })

                  if (category.description) {
                    Text(category.description)
                      .fontSize(12)
                      .fontColor('#999999')
                      .maxLines(1)
                      .textOverflow({ overflow: TextOverflow.Ellipsis })
                      .margin({ top: 4 })
                  }
                }
                .alignItems(HorizontalAlign.Start)
                .layoutWeight(1)

                Text(`${category.comicCount} 漫画`)
                  .fontSize(12)
                  .fontColor('#999999')
                  .margin({ right: 12 })

                Image($r('sys.media.ohos_ic_public_remove'))
                  .width(20)
                  .height(20)
                  .fillColor('#FA2A2D')
                  .onClick(() => {
                    this.deleteType = 'category'
                    this.deleteId = category.id
                    this.deleteName = category.name
                    this.showDeleteConfirmDialog = true
                  })
              }
              .width('100%')
              .padding({ left: 16, right: 16, top: 12, bottom: 12 })
              .alignItems(VerticalAlign.Center)
            }
          })
        }
        .layoutWeight(1)
        .width('100%')
        .divider({ strokeWidth: 0.5, color: '#E5E5E5', startMargin: 16, endMargin: 16 })
      }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  TagTab() {
    Column() {
      Row() {
        Text(`共 ${this.tags.length} 个标签`)
          .fontSize(13)
          .fontColor('#999999')

        Blank()

        Button('新增标签')
          .height(32)
          .fontSize(13)
          .fontColor('#FFFFFF')
          .backgroundColor('#007DFF')
          .borderRadius(16)
          .padding({ left: 12, right: 12 })
          .onClick(() => {
            this.newTagName = ''
            this.showAddTagDialog = true
          })
      }
      .width('100%')
      .padding({ left: 16, right: 16, top: 12, bottom: 8 })

      if (this.tags.length === 0) {
        Column() {
          Text('暂无标签')
            .fontSize(14)
            .fontColor('#CCCCCC')
        }
        .width('100%')
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
      } else {
        List() {
          ForEach(this.tags, (tag: Tag) => {
            ListItem() {
              Row() {
                Text(tag.name)
                  .fontSize(15)
                  .fontColor('#181818')
                  .layoutWeight(1)

                Text(`${tag.comicCount} 漫画`)
                  .fontSize(12)
                  .fontColor('#999999')
                  .margin({ right: 12 })

                Image($r('sys.media.ohos_ic_public_remove'))
                  .width(20)
                  .height(20)
                  .fillColor('#FA2A2D')
                  .onClick(() => {
                    this.deleteType = 'tag'
                    this.deleteId = tag.id
                    this.deleteName = tag.name
                    this.showDeleteConfirmDialog = true
                  })
              }
              .width('100%')
              .padding({ left: 16, right: 16, top: 12, bottom: 12 })
              .alignItems(VerticalAlign.Center)
            }
          })
        }
        .layoutWeight(1)
        .width('100%')
        .divider({ strokeWidth: 0.5, color: '#E5E5E5', startMargin: 16, endMargin: 16 })
      }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  AddCategoryDialog() {
    Column() {
      Column() {
        Text('新增分类')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#181818')
          .width('100%')
          .textAlign(TextAlign.Center)
          .margin({ bottom: 16 })

        Text('名称')
          .fontSize(13)
          .fontColor('#999999')
          .width('100%')
          .margin({ bottom: 6 })

        TextInput({ text: this.newCategoryName, placeholder: '输入分类名称' })
          .width('100%')
          .height(40)
          .fontColor('#181818')
          .backgroundColor('#F5F5F5')
          .onChange((value: string) => {
            this.newCategoryName = value
          })

        Text('描述')
          .fontSize(13)
          .fontColor('#999999')
          .width('100%')
          .margin({ top: 12, bottom: 6 })

        TextInput({ text: this.newCategoryDescription, placeholder: '输入分类描述（可选）' })
          .width('100%')
          .height(40)
          .fontColor('#181818')
          .backgroundColor('#F5F5F5')
          .onChange((value: string) => {
            this.newCategoryDescription = value
          })

        Row() {
          Button('取消')
            .layoutWeight(1)
            .height(40)
            .fontSize(14)
            .fontColor('#999999')
            .backgroundColor('#F5F5F5')
            .borderRadius(20)
            .onClick(() => {
              this.showAddCategoryDialog = false
            })

          Button('创建')
            .layoutWeight(1)
            .height(40)
            .fontSize(14)
            .fontColor('#FFFFFF')
            .backgroundColor('#007DFF')
            .borderRadius(20)
            .margin({ left: 12 })
            .onClick(() => {
              this.createCategory()
            })
        }
        .width('100%')
        .margin({ top: 20 })
      }
      .width('80%')
      .backgroundColor('#FFFFFF')
      .shadow({ radius: 6, color: '#10000000', offsetY: 1 })
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
  AddTagDialog() {
    Column() {
      Column() {
        Text('新增标签')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#181818')
          .width('100%')
          .textAlign(TextAlign.Center)
          .margin({ bottom: 16 })

        Text('名称')
          .fontSize(13)
          .fontColor('#999999')
          .width('100%')
          .margin({ bottom: 6 })

        TextInput({ text: this.newTagName, placeholder: '输入标签名称' })
          .width('100%')
          .height(40)
          .fontColor('#181818')
          .backgroundColor('#F5F5F5')
          .onChange((value: string) => {
            this.newTagName = value
          })

        Row() {
          Button('取消')
            .layoutWeight(1)
            .height(40)
            .fontSize(14)
            .fontColor('#999999')
            .backgroundColor('#F5F5F5')
            .borderRadius(20)
            .onClick(() => {
              this.showAddTagDialog = false
            })

          Button('创建')
            .layoutWeight(1)
            .height(40)
            .fontSize(14)
            .fontColor('#FFFFFF')
            .backgroundColor('#007DFF')
            .borderRadius(20)
            .margin({ left: 12 })
            .onClick(() => {
              this.createTag()
            })
        }
        .width('100%')
        .margin({ top: 20 })
      }
      .width('80%')
      .backgroundColor('#FFFFFF')
      .shadow({ radius: 6, color: '#10000000', offsetY: 1 })
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
  DeleteConfirmDialog() {
    Column() {
      Column() {
        Text('确认删除')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor('#181818')
          .width('100%')
          .textAlign(TextAlign.Center)
          .margin({ bottom: 12 })

        Text(`确定要删除${this.deleteType === 'category' ? '分类' : '标签'}「${this.deleteName}」吗？`)
          .fontSize(14)
          .fontColor('#999999')
          .width('100%')
          .textAlign(TextAlign.Center)
          .margin({ bottom: 20 })

        Row() {
          Button('取消')
            .layoutWeight(1)
            .height(40)
            .fontSize(14)
            .fontColor('#999999')
            .backgroundColor('#F5F5F5')
            .borderRadius(20)
            .onClick(() => {
              this.showDeleteConfirmDialog = false
            })

          Button('删除')
            .layoutWeight(1)
            .height(40)
            .fontSize(14)
            .fontColor('#FFFFFF')
            .backgroundColor('#EF4444')
            .borderRadius(20)
            .margin({ left: 12 })
            .onClick(() => {
              this.confirmDelete()
            })
        }
        .width('100%')
      }
      .width('80%')
      .backgroundColor('#FFFFFF')
      .shadow({ radius: 6, color: '#10000000', offsetY: 1 })
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