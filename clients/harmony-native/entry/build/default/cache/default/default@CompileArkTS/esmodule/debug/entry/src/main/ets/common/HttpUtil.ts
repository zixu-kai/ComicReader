import axios from "@package:pkg_modules/.ohpm/@ohos+axios@2.2.10/pkg_modules/@ohos/axios/index";
import type { AxiosInstance } from "@package:pkg_modules/.ohpm/@ohos+axios@2.2.10/pkg_modules/@ohos/axios/index";
import { Constants } from "@bundle:com.comicreader.harmony/entry/ets/common/Constants";
const api: AxiosInstance = axios.create({
    baseURL: Constants.BASE_URL,
    timeout: 30000,
});
export default api;
