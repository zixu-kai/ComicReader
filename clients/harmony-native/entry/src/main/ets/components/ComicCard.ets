import { Comic } from '../model/ComicModels'
import { ComicService } from '../service/ComicService'

@Component
export struct ComicCard {
  @Prop comic: Comic
  onTap: (comic: Comic) => void = (_c: Comic) => {}

  build() {
    Column() {
      Stack() {
        if (this.comic.coverPath) {
          Image(ComicService.getCoverUrl(this.comic.id))
            .width('100%')
            .height(170)
            .objectFit(ImageFit.Cover)
            .borderRadius({ topLeft: 12, topRight: 12 })
        } else {
          Column() {
            Text(this.comic.title)
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

        Text(this.comic.fileType.toUpperCase())
          .fontSize(10)
          .fontWeight(FontWeight.Medium)
          .fontColor('#FFFFFF')
          .backgroundColor('#007DFF')
          .borderRadius(4)
          .padding({ left: 5, right: 5, top: 2, bottom: 2 })
          .position({ x: '68%', y: 8 })

        if (this.comic.readingProgress && !this.comic.readingProgress.isCompleted) {
          Progress({ value: this.comic.readingProgress.currentPage, total: this.comic.readingProgress.totalPages })
            .width('100%')
            .height(3)
            .color('#007DFF')
            .backgroundColor('#E5E5E5')
            .position({ x: 0, y: 167 })
        }

        if (this.comic.readingProgress && this.comic.readingProgress.isCompleted) {
          Text('已完成')
            .fontSize(10)
            .fontColor('#FFFFFF')
            .backgroundColor('#45A848')
            .borderRadius(4)
            .padding({ left: 5, right: 5, top: 2, bottom: 2 })
            .position({ x: '62%', y: 8 })
        }
      }
      .width('100%')
      .height(170)

      Column() {
        Text(this.comic.title)
          .fontSize(14)
          .fontColor('#181818')
          .fontWeight(FontWeight.Medium)
          .maxLines(2)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .width('100%')

        if (this.comic.author) {
          Text(this.comic.author)
            .fontSize(12)
            .fontColor('#999999')
            .maxLines(1)
            .textOverflow({ overflow: TextOverflow.Ellipsis })
            .width('100%')
            .margin({ top: 4 })
        }

        Row() {
          if (this.comic.rating && this.comic.rating.score > 0) {
            Row() {
              Text('★')
                .fontSize(12)
                .fontColor('#F5A623')
              Text(this.comic.rating.score.toString())
                .fontSize(11)
                .fontColor('#999999')
                .margin({ left: 2 })
            }
          } else {
            Text('未评分')
              .fontSize(11)
              .fontColor('#CCCCCC')
          }

          if (this.comic.pageCount > 0) {
            Text(`${this.comic.pageCount}页`)
              .fontSize(11)
              .fontColor('#CCCCCC')
          }
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
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
      offsetX: 0,
      offsetY: 2
    })
    .onClick(() => this.onTap(this.comic))
  }
}