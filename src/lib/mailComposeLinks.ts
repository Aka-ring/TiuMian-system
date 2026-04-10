/**
 * 拉起邮件撰写：收件人、主题、正文预填。
 * 说明：Gmail 有稳定 compose 参数；QQ 使用 wx 写信页；网易网页版无稳定公开深链，按钮打开官方网页版入口，登录后自行粘贴收件人与正文。
 */

/** 网易邮箱网页版（海外/加速入口，与产品约定一致） */
export function buildNetEaseWebMailUrl(): string {
  return 'https://hw.mail.163.com/'
}

export function buildMailtoHref(to: string, subject: string, body: string): string {
  const t = encodeURIComponent(to.trim())
  const su = encodeURIComponent(subject)
  const b = encodeURIComponent(body)
  return `mailto:${t}?subject=${su}&body=${b}`
}

/** Gmail 网页写信（需浏览器已登录 Google 账号） */
export function buildGmailComposeUrl(to: string, subject: string, body: string): string {
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    to: to.trim(),
    su: subject,
    body,
  })
  return `https://mail.google.com/mail/?${params.toString()}`
}

/**
 * QQ 邮箱 wx 端写信页（需已登录 QQ 邮箱；参数经 encodeURIComponent 放入 hash 查询）
 */
export function buildQQMailComposeUrl(to: string, subject: string, body: string): string {
  const q = new URLSearchParams({
    to: to.trim(),
    subject,
    body,
  })
  return `https://wx.mail.qq.com/home/index#/compose?${q.toString()}`
}

export function formatFullEmailForCopy(profEmail: string, subject: string, content: string): string {
  const to = profEmail.trim()
  return `收件人：${to || '（未填写）'}\n主题：${subject}\n\n${content}`
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fallback */
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
