export default function WorkspaceView() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <header className="mb-6">
            <p className="text-sm font-medium text-blue-600">Workspace</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              保研智能套磁输入区
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              填写导师信息、研究匹配方式与个人背景，后续将用于自动生成高质量套磁邮件。
            </p>
          </header>

          <form className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">导师姓名</label>
                <input
                  type="text"
                  placeholder="例如：王教授"
                  className="w-full rounded-xl border-0 bg-white px-4 py-3 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">导师邮箱</label>
                <input
                  type="email"
                  placeholder="prof@example.edu"
                  className="w-full rounded-xl border-0 bg-white px-4 py-3 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">学校 / 机构</label>
              <input
                type="text"
                placeholder="例如：清华大学"
                className="w-full rounded-xl border-0 bg-white px-4 py-3 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">匹配模式</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800"
                >
                  URL 模式
                </button>
                <button
                  type="button"
                  className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-100"
                >
                  摘要模式
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">简历文本</label>
              <textarea
                rows={7}
                placeholder="粘贴你的教育背景、科研经历、竞赛成果、论文与技能信息..."
                className="w-full rounded-xl border-0 bg-white px-4 py-3 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">补充输入</label>
              <textarea
                rows={4}
                placeholder="例如：希望突出机器学习项目经验，语气保持礼貌但自信。"
                className="w-full rounded-xl border-0 bg-white px-4 py-3 text-slate-900 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="button"
              className="w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-800"
            >
              生成套磁邮件（静态演示）
            </button>
          </form>
        </section>

        <section className="rounded-2xl bg-slate-950 p-6 text-slate-200 shadow-sm md:p-8">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium tracking-wide text-slate-300">
              Generated Email Preview
            </h2>
            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
              Read Only
            </span>
          </header>

          <div className="h-[700px] overflow-auto rounded-xl border border-slate-800 bg-slate-900/70 p-5 font-mono text-sm leading-7">
            <p className="text-slate-400">{`// 邮件内容将在这里展示`}</p>
            <p className="mt-4 text-slate-300">{`Subject: [待生成]`}</p>
            <p className="mt-6 whitespace-pre-wrap text-slate-200">{`尊敬的导师您好，\n\n（此处为未来生成的套磁邮件正文预览区。）\n\n1. 将展示根据导师信息与简历生成的个性化内容；\n2. 支持后续复制、编辑与再次生成；\n3. 保持代码编辑器风格，便于聚焦内容本身。\n\n此致\n敬礼`}</p>
          </div>
        </section>
      </div>
    </main>
  )
}
