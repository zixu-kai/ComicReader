import { useState } from 'react'
import { Heart, X } from 'lucide-react'

declare const __SHOW_DONATE__: boolean
const SHOW_DONATE = __SHOW_DONATE__

export default function DonateButton() {
  const [open, setOpen] = useState(false)

  if (!SHOW_DONATE) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-pink-400 hover:bg-pink-500/10 hover:text-pink-300 transition-colors"
        title="打赏作者"
      >
        <Heart className="h-5 w-5 shrink-0" />
        打赏作者
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setOpen(false)}>
          <div
            className="relative mx-4 max-w-sm rounded-2xl bg-gray-900 p-6 shadow-2xl border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-1 text-center text-lg font-bold text-white">支持作者</h2>
            <p className="mb-4 text-center text-sm text-gray-400">如果这个项目对你有帮助，欢迎请作者喝杯咖啡</p>

            <div className="flex gap-4">
              <div className="flex-1 text-center">
                <img
                  src="/donate/wechat_pay.png"
                  alt="微信赞赏"
                  className="mx-auto mb-2 w-full rounded-lg"
                />
                <span className="text-xs text-gray-400">微信</span>
              </div>
              <div className="flex-1 text-center">
                <img
                  src="/donate/alipay.jpg"
                  alt="支付宝"
                  className="mx-auto mb-2 w-full rounded-lg"
                />
                <span className="text-xs text-gray-400">支付宝</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}