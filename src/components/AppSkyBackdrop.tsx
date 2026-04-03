/**
 * 启航台 / 工作台 / 邮件看板 共用背景：
 * 上浅天蓝 → 下奶油暖白（无底部雾紫）。
 */
export default function AppSkyBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background:
          'linear-gradient(180deg, #E0F2F7 0%, #E8F4F9 28%, #F5F9FB 52%, #FFF4E6 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          background:
            'radial-gradient(ellipse 110% 60% at 50% -8%, rgba(224, 242, 247, 0.85) 0%, transparent 52%), radial-gradient(ellipse 100% 50% at 50% 102%, rgba(255, 244, 230, 0.45) 0%, transparent 48%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.2]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(120, 130, 140, 0.07) 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />
    </div>
  )
}
