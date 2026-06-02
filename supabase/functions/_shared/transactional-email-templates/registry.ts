import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  to?: string
}

import { template as blueprintReady } from './blueprint-ready.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'blueprint-ready': blueprintReady,
}
