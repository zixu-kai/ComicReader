import { Constants, navigateTo, navigateToTab } from '../common/Constants'
import { ComicService } from '../service/ComicService'
import api from '../common/HttpUtil'
import preferences from '@ohos.data.preferences'
import { common } from '@kit.AbilityKit'

@Entry
@Component
struct SettingsPage {
  @State serverUrl: string = Constants.BASE_URL
  @State scanStatus: string = ''
  @State isScanning: boolean = false
  @State isSaving: boolean = false
  private context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext

  async aboutToAppear(): Promise<void> {
    await this.loadPreferences()
  }

  async loadPreferences(): Promise<void> {
    try {
      const pref = await preferences.getPreferences(this.context, Constants.PREF_NAME)
      const savedUrl = await pref.get(Constants.KEY_SERVER_URL, Constants.BASE_URL) as string
      this.serverUrl = savedUrl
    } catch (e) {
      console.error('Failed to load preferences: ' + JSON.stringify(e))
    }
  }

  async savePreferences(): Promise<void> {
    try {
      this.isSaving = true
      const pref = await preferences.getPreferences(this.context, Constants.PREF_NAME)
      await pref.put(Constants.KEY_SERVER_URL, this.serverUrl)
      await pref.flush()
      api.defaults.baseURL = this.serverUrl
      this.isSaving = false
    } catch (e) {
      console.error('Failed to save preferences: ' + JSON.stringify(e))
      this.isSaving = false
    }
  }

  async startScan(): Promise<void> {
    this.isScanning = true
    this.scanStatus = '扫描中...'
    try {
      const result = await ComicService.scan()
      this.scanStatus = `扫描完成: 新增${result.added} 更新${result.updated} 移除${result.removed}`
    } catch (e) {
      this.scanStatus = '扫描失败: ' + JSON.stringify(e)
    } finally {
      this.isScanning = false
    }
  }

  build() {
    Column() {
      Row() {
        Image($r('sys.media.ohos_ic_public_arrow_left'))
          .width(24)
          .height(24)
          .fillColor('#181818')
          .onClick(async () => {
            await this.savePreferences()
            try { navigateToTab(this.getUIContext(), 'pages/HomePage') } catch (e) { console.error('Back failed: ' + JSON.stringify(e)) }
          })

        Text('设置')
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

      Scroll() {
        Column() {
          Column() {
            Text('服务器配置')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#181818')
              .width('100%')
              .margin({ bottom: 16 })

            Text('服务器地址')
              .fontSize(14)
              .fontColor('#999999')
              .width('100%')
              .margin({ bottom: 8 })

            TextInput({ text: this.serverUrl, placeholder: 'http://IP:端口' })
              .width('100%')
              .height(44)
              .type(InputType.Normal)
              .fontColor('#181818')
              .backgroundColor('#FFFFFF')
              .onChange((value: string) => {
                this.serverUrl = value
              })

            Text('格式: http://IP地址:端口号')
              .fontSize(12)
              .fontColor('#999999')
              .width('100%')
              .margin({ top: 4 })

            Button('保存服务器地址')
              .width('100%')
              .height(44)
              .fontSize(15)
              .fontColor('#FFFFFF')
              .backgroundColor('#007DFF')
              .borderRadius(22)
              .margin({ top: 16 })
              .enabled(!this.isSaving)
              .onClick(() => this.savePreferences())
          }
          .width('100%')
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .padding(16)
          .shadow({ radius: 6, color: '#10000000', offsetY: 1 })
          .margin({ top: 16, left: 16, right: 16 })

          Column() {
            Text('漫画扫描')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#181818')
              .width('100%')
              .margin({ bottom: 16 })

            Text('扫描服务器上的漫画目录，发现新增或变更的漫画')
              .fontSize(14)
              .fontColor('#999999')
              .width('100%')
              .margin({ bottom: 12 })

            Button('开始扫描')
              .width('100%')
              .height(44)
              .fontSize(15)
              .fontColor('#FFFFFF')
              .backgroundColor('#007DFF')
              .borderRadius(22)
              .margin({ top: 8 })
              .enabled(!this.isScanning)
              .onClick(() => this.startScan())

            if (this.scanStatus) {
              Text(this.scanStatus)
                .fontSize(14)
                .fontColor(this.scanStatus.includes('失败') ? '#FA2A2D' : '#45A848')
                .width('100%')
                .margin({ top: 12 })
                .textAlign(TextAlign.Center)
            }
          }
          .width('100%')
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .padding(16)
          .shadow({ radius: 6, color: '#10000000', offsetY: 1 })
          .margin({ top: 12, left: 16, right: 16 })

          Column() {
            Text('关于')
              .fontSize(18)
              .fontWeight(FontWeight.Bold)
              .fontColor('#181818')
              .width('100%')
              .margin({ bottom: 12 })

            Row() {
              Text('应用名称')
                .fontSize(14)
                .fontColor('#181818')
                .layoutWeight(1)

              Text('ComicReader')
                .fontSize(14)
                .fontColor('#999999')
            }
            .width('100%')
            .padding({ top: 8, bottom: 8 })
            .border({ width: { bottom: 0.5 }, color: '#E5E5E5' })

            Row() {
              Text('版本')
                .fontSize(14)
                .fontColor('#181818')
                .layoutWeight(1)

              Text('1.0.0')
                .fontSize(14)
                .fontColor('#999999')
            }
            .width('100%')
            .padding({ top: 8, bottom: 8 })
            .border({ width: { bottom: 0.5 }, color: '#E5E5E5' })

            Row() {
              Text('技术栈')
                .fontSize(14)
                .fontColor('#181818')
                .layoutWeight(1)

              Text('ArkTS + HarmonyOS NEXT')
                .fontSize(14)
                .fontColor('#999999')
            }
            .width('100%')
            .padding({ top: 8, bottom: 8 })
          }
          .width('100%')
          .backgroundColor('#FFFFFF')
          .borderRadius(12)
          .padding(16)
          .shadow({ radius: 6, color: '#10000000', offsetY: 1 })
          .margin({ top: 12, left: 16, right: 16, bottom: 24 })
        }
      }
      .layoutWeight(1)
      .width('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#F1F3F5')
  }
}