import { Client } from '@notionhq/client'

export const notion = new Client({ auth: process.env.EXPO_PUBLIC_NOTION_SECRET_KEY })

