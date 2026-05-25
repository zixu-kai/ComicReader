import { TabItem } from '../model/ComicModels'

@Component
export struct TabBar {
  @Link currentTab: number
  onTabClick: (tab: number) => void = (_tab: number) => {}

  private tabs: TabItem[] = []

  aboutToAppear(): void {
    let tab0 = new TabItem()
    tab0.icon = '🏠'
    tab0.label = '首页'
    tab0.index = 0

    let tab1 = new TabItem()
    tab1.icon = '📚'
    tab1.label = '漫画'
    tab1.index = 1

    let tab2 = new TabItem()
    tab2.icon = '📖'
    tab2.label = '图书'
    tab2.index = 2

    let tab3 = new TabItem()
    tab3.icon = '🏷'
    tab3.label = '分类'
    tab3.index = 3

    let tab4 = new TabItem()
    tab4.icon = '⭐'
    tab4.label = '收藏'
    tab4.index = 4

    let tab5 = new TabItem()
    tab5.icon = '🎲'
    tab5.label = '随机'
    tab5.index = 5

    let tab6 = new TabItem()
    tab6.icon = '⚙'
    tab6.label = '设置'
    tab6.index = 6

    this.tabs = [tab0, tab1, tab2, tab3, tab4, tab5, tab6]
  }

  build() {
    Row() {
      ForEach(this.tabs, (tab: TabItem) => {
        Column() {
          Text(tab.icon)
            .fontSize(20)

          Text(tab.label)
            .fontSize(10)
            .fontColor(this.currentTab === tab.index ? '#007DFF' : '#999999')
            .fontWeight(this.currentTab === tab.index ? FontWeight.Medium : FontWeight.Regular)
            .margin({ top: 2 })
        }
        .layoutWeight(1)
        .justifyContent(FlexAlign.Center)
        .alignItems(HorizontalAlign.Center)
        .padding({ top: 6, bottom: 8 })
        .onClick(() => {
          this.onTabClick(tab.index)
        })
      })
    }
    .width('100%')
    .backgroundColor('#FFFFFF')
    .border({ width: { top: 0.5 }, color: '#E5E5E5' })
  }
}