import UIAbility from "@ohos:app.ability.UIAbility";
import type window from "@ohos:window";
import type AbilityConstant from "@ohos:app.ability.AbilityConstant";
import type Want from "@ohos:app.ability.Want";
export default class EntryAbility extends UIAbility {
    onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
        console.info('EntryAbility onCreate');
    }
    onDestroy(): void {
        console.info('EntryAbility onDestroy');
    }
    onWindowStageCreate(windowStage: window.WindowStage): void {
        console.info('EntryAbility onWindowStageCreate');
        windowStage.loadContent('pages/HomePage', (err: BusinessError, data: void) => {
            if (err.code) {
                console.error('Failed to load content: ' + JSON.stringify(err));
                return;
            }
            console.info('Succeeded in loading content');
        });
    }
}
