/**
 * 表单数据类型：
 * 用于描述前端提交给后端的套磁生成任务参数。
 */
export interface FormData {
  /**
   * 导师姓名：
   * 用于在邮件中进行准确称呼，并参与内容个性化生成。
   */
  prof_name: string

  /**
   * 导师邮箱：
   * 作为邮件发送目标地址，也可用于结果校验与回显。
   */
  prof_email: string

  /**
   * 学校名称：
   * 用于标识导师所属院校，帮助模型生成更贴合场景的表达。
   */
  institution: string

  /**
   * 简历文本：
   * 候选人的核心背景信息（经历、成果、方向等），
   * 是生成高质量套磁邮件的主要输入之一。
   */
  resume_text: string

  /**
   * 匹配模式：
   * - 'url'：基于外部链接内容（如导师主页/实验室页面）进行匹配；
   * - 'abstract'：基于论文摘要或研究简介文本进行匹配。
   */
  match_type: 'url' | 'abstract'

  /**
   * URL 输入：
   * 当选择 URL 模式时，用于填写导师主页、实验室页面或论文链接。
   */
  url: string

  /**
   * 摘要输入（界面标签为 Abstract；提交后端时字段名仍为 zhaiyao）：
   * 当选择摘要模式时，用于粘贴论文摘要或研究简介文本。
   */
  zhaiyao: string

  /**
   * 补充输入：
   * 额外上下文信息，例如目标研究方向、个人偏好、限制条件等，
   * 用于进一步提升生成结果的针对性与可读性。
   */
  extra_input: string
}

/**
 * 任务状态类型：
 * 表示套磁生成任务在前端界面的生命周期状态。
 */
export type TaskStatus = 'idle' | 'processing' | 'success' | 'error'

/**
 * 邮件生成结果类型：
 * 用于承载后端返回的单次任务核心结果数据。
 */
/**
 * 邮件看板单条卡片数据（本地列表与持久化共用）。
 */
export type MailCardModel = {
  id: string
  createdAt: number
  subject: string
  content: string
}

export interface EmailResult {
  /**
   * 任务唯一标识：
   * 用于追踪本次生成任务、轮询状态或关联日志。
   */
  task_id: string

  /**
   * 邮件主题：
   * 生成后的邮件标题，可直接用于邮件客户端的 Subject 字段。
   */
  subject: string

  /**
   * 邮件正文：
   * 生成后的完整套磁邮件内容，可在前端预览、编辑或发送。
   */
  content: string
}
