import type { FormData } from '../types'

export type FormErrors = Partial<Record<keyof FormData, string>>

function validateField(next: FormData, field: keyof FormData, errors: FormErrors) {
  const v = next[field]
  if (field === 'prof_name' || field === 'institution') {
    errors[field] = v && String(v).trim().length > 0 ? '' : '请填写此字段'
  }
  if (field === 'applicant_direction') {
    errors.applicant_direction =
      v && String(v).trim().length > 0 ? '' : '请填写申请方向'
  }
  if (field === 'prof_email') {
    const text = String(v).trim()
    const ok =
      text.length > 0 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text)
    errors.prof_email = ok ? '' : '请输入有效的邮箱地址'
  }
  if (field === 'resume_text') {
    errors.resume_text =
      v && String(v).trim().length > 0 ? '' : '请粘贴你的简历文本'
  }
  if (field === 'url' && next.match_type === 'url') {
    const text = String(v ?? '').trim()
    errors.url = text.length > 0 ? '' : 'URL 模式下，此字段必填'
  } else if (field === 'url') {
    // 非 URL 模式时清空历史 URL 错误，避免按钮被误禁用
    errors.url = ''
  }
  if (field === 'zhaiyao' && next.match_type === 'abstract') {
    const text = String(v ?? '').trim()
    errors.zhaiyao = text.length > 0 ? '' : '摘要模式下，此字段必填'
  } else if (field === 'zhaiyao') {
    // 非摘要模式时清空历史摘要错误，避免按钮被误禁用
    errors.zhaiyao = ''
  }
}

/** 单字段变更后的实时校验（保留其他字段已有错误，除非被本规则清空） */
export function revalidateAfterFieldChange(
  next: FormData,
  changedKey: keyof FormData,
  prev: FormErrors,
): FormErrors {
  const nextErrors: FormErrors = { ...prev }
  validateField(next, changedKey, nextErrors)
  if (changedKey === 'match_type') {
    validateField(next, 'url', nextErrors)
    validateField(next, 'zhaiyao', nextErrors)
  }
  const cleaned: FormErrors = {}
  for (const [k, msg] of Object.entries(nextErrors) as [keyof FormData, string][]) {
    if (msg) cleaned[k] = msg
  }
  return cleaned
}

/** 提交前整表校验 */
export function validateFormForSubmit(formData: FormData): FormErrors {
  const aggregatedErrors: FormErrors = {}
  const checkRequired = (field: keyof FormData, message: string) => {
    const v = formData[field]
    if (!v || String(v).trim().length === 0) {
      aggregatedErrors[field] = message
    }
  }

  checkRequired('prof_name', '请填写导师姓名')
  checkRequired('prof_email', '请填写导师邮箱')
  checkRequired('institution', '请填写学校 / 机构')
  checkRequired('applicant_direction', '请填写申请方向')
  checkRequired('resume_text', '请粘贴你的简历文本')

  if (formData.match_type === 'url') {
    checkRequired('url', 'URL 模式下，此字段必填')
  } else {
    checkRequired('zhaiyao', '摘要模式下，此字段必填')
  }

  const email = String(formData.prof_email ?? '').trim()
  if (
    email.length === 0 ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  ) {
    aggregatedErrors.prof_email = '请输入有效的邮箱地址'
  }

  return aggregatedErrors
}
