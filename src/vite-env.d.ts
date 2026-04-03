/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 生产/预览时 n8n Webhook 根地址，勿带末尾斜杠。例：https://xxx.zeabur.app */
  readonly VITE_WEBHOOK_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
