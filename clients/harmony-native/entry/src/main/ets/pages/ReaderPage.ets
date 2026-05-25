import { Constants, navigateTo } from '../common/Constants'
import { router } from '@kit.ArkUI'
import webview from '@ohos.web.webview'

@Entry
@Component
struct ReaderPage {
  @State comicId: number = 0
  controller: webview.WebviewController = new webview.WebviewController()

  aboutToAppear(): void {
    const params = this.getUIContext().getRouter().getParams() as Record<string, number>
    if (params && params.comicId) {
      this.comicId = params.comicId
    }
  }

  build() {
    Column() {
      Row() {
        Image($r('sys.media.ohos_ic_public_arrow_left'))
          .width(24)
          .height(24)
          .fillColor('#E5E7EB')
          .onClick(() => { try { this.getUIContext().getRouter().back() } catch (e) { console.error('Back failed: ' + JSON.stringify(e)) } })

        Text('漫画阅读')
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

      Web({ src: `${Constants.BASE_URL}/comic/${this.comicId}`, controller: this.controller })
        .layoutWeight(1)
        .width('100%')
        .domStorageAccess(true)
        .javaScriptAccess(true)
        .mixedMode(MixedMode.All)
        .onlineImageAccess(true)
        .zoomAccess(true)
        .cacheMode(CacheMode.Default)
        .darkMode(WebDarkMode.On)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#0F172A')
  }
}
